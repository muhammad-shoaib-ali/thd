<?php
/**
 * Plugin Name: TechHowDaily — front-end revalidation
 * Description: Tells the Next.js front end to refresh a guide the moment it is
 *              published or updated, instead of waiting out the five-minute
 *              revalidate window. Lives in mu-plugins so it always loads and
 *              survives theme and plugin changes.
 * Version:     1.0.0
 *
 * SET TWO THINGS in wp-config.php:
 *   define( 'THD_FRONTEND_URL',     'https://techhowdaily.com' );
 *   define( 'THD_REVALIDATE_SECRET', 'the same value as REVALIDATE_SECRET' );
 *
 * OPTIONAL: if WordPress and the front end share one machine (an Oracle
 * Cloud A1 instance, say), add this so the call never leaves the box:
 *   define( 'THD_REVALIDATE_URL', 'http://127.0.0.1:3000/api/revalidate' );
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ping the front end for one post.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
/**
 * Where to send the revalidation call. Prefers an explicit
 * THD_REVALIDATE_URL, which lets a single-VM install stay on loopback.
 *
 * @return string
 */
function thd_revalidate_endpoint() {
	if ( defined( 'THD_REVALIDATE_URL' ) && THD_REVALIDATE_URL ) {
		return THD_REVALIDATE_URL;
	}
	if ( defined( 'THD_FRONTEND_URL' ) && THD_FRONTEND_URL ) {
		return untrailingslashit( THD_FRONTEND_URL ) . '/api/revalidate';
	}
	return '';
}

function thd_revalidate_post( $post_id, $post ) {
	if ( ! defined( 'THD_REVALIDATE_SECRET' ) || ! THD_REVALIDATE_SECRET ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}
	if ( 'publish' !== $post->post_status && 'trash' !== $post->post_status ) {
		return;
	}

	$endpoint = thd_revalidate_endpoint();
	if ( ! $endpoint ) {
		return;
	}

	$cats = wp_get_post_categories( $post_id, array( 'fields' => 'slugs' ) );

	$res = wp_remote_post(
		$endpoint,
		array(
			'timeout'  => 8,
			'blocking' => false, // fire and forget: never slow down Publish
			'headers'  => array( 'Content-Type' => 'application/json' ),
			'body'     => wp_json_encode(
				array(
					'secret'   => THD_REVALIDATE_SECRET,
					'slug'     => $post->post_name,
					'category' => isset( $cats[0] ) ? $cats[0] : null,
				)
			),
		)
	);

	if ( is_wp_error( $res ) ) {
		error_log( '[thd-revalidate] ' . $res->get_error_message() );
	}
}

add_action( 'save_post_post', 'thd_revalidate_post', 10, 2 );
add_action( 'save_post_page', 'thd_revalidate_post', 10, 2 );

/** Category edits change the archive and the tile counts. */
add_action(
	'edited_category',
	function ( $term_id ) {
		if ( ! defined( 'THD_REVALIDATE_SECRET' ) || ! defined( 'THD_FRONTEND_URL' ) ) {
			return;
		}
		$term = get_term( $term_id, 'category' );
		if ( ! $term || is_wp_error( $term ) ) {
			return;
		}
		wp_remote_post(
			thd_revalidate_endpoint(),
			array(
				'timeout'  => 8,
				'blocking' => false,
				'headers'  => array( 'Content-Type' => 'application/json' ),
				'body'     => wp_json_encode(
					array(
						'secret'   => THD_REVALIDATE_SECRET,
						'category' => $term->slug,
					)
				),
			)
		);
	}
);

/** A manual button, for when you want to force a full refresh. */
add_action(
	'admin_bar_menu',
	function ( $bar ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$bar->add_node(
			array(
				'id'    => 'thd-revalidate',
				'title' => 'Refresh site',
				'href'  => wp_nonce_url( admin_url( 'admin-post.php?action=thd_revalidate_all' ), 'thd_reval' ),
			)
		);
	},
	100
);

add_action(
	'admin_post_thd_revalidate_all',
	function () {
		check_admin_referer( 'thd_reval' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Nope.' );
		}
		if ( defined( 'THD_FRONTEND_URL' ) && defined( 'THD_REVALIDATE_SECRET' ) ) {
			wp_remote_post(
				thd_revalidate_endpoint(),
				array(
					'timeout' => 10,
					'headers' => array( 'Content-Type' => 'application/json' ),
					'body'    => wp_json_encode( array( 'secret' => THD_REVALIDATE_SECRET ) ),
				)
			);
		}
		wp_safe_redirect( admin_url() );
		exit;
	}
);
