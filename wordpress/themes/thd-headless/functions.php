<?php
/**
 * TechHowDaily Headless — theme functions.
 *
 * Everything here removes something. This theme adds no markup, no styles and
 * no scripts; its whole job is to stop WordPress behaving like a website.
 *
 * @package thd-headless
 */

defined( 'ABSPATH' ) || exit;

/**
 * Where the real site lives. Set this, or the redirect cannot work.
 * Override in wp-config.php with:  define( 'THD_FRONTEND_URL', 'https://…' );
 */
function thd_frontend_url() {
	if ( defined( 'THD_FRONTEND_URL' ) && THD_FRONTEND_URL ) {
		return untrailingslashit( THD_FRONTEND_URL );
	}
	return 'https://techhowdaily.com';
}

/* -------------------------------------------------------------------------
 * 1. Send front-end visitors to the real site.
 *
 * template_redirect fires only for requests WordPress is about to render as
 * a page. /graphql is handled by WPGraphQL before this point, /wp-json is the
 * REST stack, and wp-admin and wp-login are separate — so none of them are
 * affected. Logged-in editors previewing a draft are let through so the
 * preview button still works.
 * ---------------------------------------------------------------------- */
add_action(
	'template_redirect',
	function () {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		if ( is_preview() && current_user_can( 'edit_posts' ) ) {
			return;
		}

		$front = thd_frontend_url();
		$target = $front;

		// Send a single post to its counterpart on the front end, so sharing a
		// wp.* URL by accident still lands the reader in the right place.
		if ( is_singular() ) {
			$post = get_queried_object();
			if ( $post instanceof WP_Post ) {
				$target = $front . '/' . $post->post_name . '/';
			}
		} elseif ( is_category() ) {
			$term = get_queried_object();
			if ( $term instanceof WP_Term ) {
				$target = $front . '/' . $term->slug . '/';
			}
		}

		wp_safe_redirect( $target, 301 );
		exit;
	},
	0
);

// wp_safe_redirect() only allows the current host unless the target is listed.
add_filter(
	'allowed_redirect_hosts',
	function ( $hosts ) {
		$host = wp_parse_url( thd_frontend_url(), PHP_URL_HOST );
		if ( $host ) {
			$hosts[] = $host;
		}
		return $hosts;
	}
);

/* -------------------------------------------------------------------------
 * 2. Theme support: only what the editor and the API need.
 * ---------------------------------------------------------------------- */
add_action(
	'after_setup_theme',
	function () {
		// Featured images — the front end uses these as card and hero art.
		add_theme_support( 'post-thumbnails' );
		// Let the block editor show the right title/excerpt fields.
		add_theme_support( 'title-tag' );
		add_post_type_support( 'page', 'excerpt' );

		// Image sizes the front end actually requests. Everything else is
		// wasted disk on every upload.
		add_image_size( 'thd-card', 640, 400, true );
		add_image_size( 'thd-thumb', 200, 200, true );
	}
);

/* -------------------------------------------------------------------------
 * 3. Strip the front-end machinery. None of it is ever rendered, and each
 *    line is one less thing to keep updated or exploited.
 * ---------------------------------------------------------------------- */
add_action(
	'init',
	function () {
		// Head cruft.
		remove_action( 'wp_head', 'wp_generator' );
		remove_action( 'wp_head', 'rsd_link' );
		remove_action( 'wp_head', 'wlwmanifest_link' );
		remove_action( 'wp_head', 'feed_links', 2 );
		remove_action( 'wp_head', 'feed_links_extra', 3 );
		remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );
		remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
		remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );

		// XML-RPC: unused headless, heavily attacked.
		add_filter( 'xmlrpc_enabled', '__return_false' );
		remove_action( 'wp_head', 'wp_resource_hints', 2 );
	}
);

// No front end means no front-end assets, ever.
add_action(
	'wp_enqueue_scripts',
	function () {
		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'wp-block-library-theme' );
		wp_dequeue_style( 'global-styles' );
		wp_dequeue_style( 'classic-theme-styles' );
	},
	100
);

/* -------------------------------------------------------------------------
 * 4. Comments off everywhere. The front end renders none, so any that
 *    arrive are invisible spam sitting in your database.
 * ---------------------------------------------------------------------- */
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'pings_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 10 );
add_action(
	'admin_menu',
	function () {
		remove_menu_page( 'edit-comments.php' );
	}
);
add_action(
	'init',
	function () {
		foreach ( get_post_types() as $type ) {
			if ( post_type_supports( $type, 'comments' ) ) {
				remove_post_type_support( $type, 'comments' );
				remove_post_type_support( $type, 'trackbacks' );
			}
		}
	},
	100
);

/* -------------------------------------------------------------------------
 * 5. Admin conveniences for a headless install.
 * ---------------------------------------------------------------------- */

// "View post" should open the front end, not this subdomain.
add_filter(
	'post_link',
	function ( $url, $post ) {
		return thd_frontend_url() . '/' . $post->post_name . '/';
	},
	10,
	2
);
add_filter(
	'preview_post_link',
	function ( $url, $post ) {
		return thd_frontend_url() . '/' . $post->post_name . '/';
	},
	10,
	2
);

// A reminder on the dashboard, so nobody wonders where the theme went.
add_action(
	'admin_notices',
	function () {
		$screen = get_current_screen();
		if ( $screen && 'dashboard' === $screen->id ) {
			printf(
				'<div class="notice notice-info"><p><strong>Headless install.</strong> This WordPress has no public front end. The website is at <a href="%1$s" target="_blank" rel="noopener">%1$s</a> and updates within five minutes of publishing.</p></div>',
				esc_url( thd_frontend_url() )
			);
		}
	}
);
