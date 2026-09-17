<?php
/**
 * Plugin Name: TechHowDaily — Site Content
 * Description: Puts every fixed string on the front end into the WordPress
 *              admin, and exposes them through WPGraphQL. Section headings,
 *              newsletter copy, footer text and button labels become editable
 *              content instead of code.
 * Version:     1.0.0
 *
 * Adds: Settings → Site Content
 * Exposes: query { siteContent { ... } }
 *
 * Category labels and descriptions are NOT here — WordPress already has
 * those. Edit them at Posts → Categories → Name and Description, and the
 * front end reads them from there.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Every editable string, with the field key, the label shown in the admin,
 * the input type, and the default used when the field is left empty.
 *
 * To add a string: add a row here, then read it in the front end. Nothing
 * else needs changing — the admin page and the GraphQL field are generated.
 */
function thd_content_fields() {
	return array(

		'brand' => array(
			'title'  => 'Brand',
			'fields' => array(
				'tagline'        => array( 'Tagline', 'text', 'AI tools, software and how-to guides' ),
				'description'    => array( 'Meta description', 'textarea', 'Practical guides to AI tools, software and apps. Tested walkthroughs, honest comparisons, and fixes that actually work.' ),
				'footerBlurb'    => array( 'Footer blurb', 'textarea', 'Practical guides to AI tools, software and apps. Tested, dated, and re-checked.' ),
				'colophon'       => array( 'Footer right-hand line', 'text', 'Made for people who read the docs.' ),
			),
		),

		'header' => array(
			'title'  => 'Header',
			'fields' => array(
				'searchPlaceholder' => array( 'Search box text', 'text', 'Search guides' ),
				'ctaLabel'          => array( 'Header button label', 'text', 'Subscribe' ),
			),
		),

		'browse' => array(
			'title'  => 'Sections block ("Pick your corner")',
			'fields' => array(
				'browseEyebrow' => array( 'Small label above heading', 'text', 'Browse' ),
				'browseHeading' => array( 'Heading', 'text', 'Pick your corner' ),
				'browseDek'     => array( 'Description', 'textarea', 'Six sections, updated most weekdays. Every guide is dated and re-tested.' ),
				'browseMore'    => array( 'Link on the right', 'text', 'All topics →' ),
			),
		),

		'latest' => array(
			'title'  => 'Latest guides block',
			'fields' => array(
				'latestEyebrow' => array( 'Small label above heading', 'text', 'Fresh' ),
				'latestHeading' => array( 'Heading', 'text', 'Latest guides' ),
				'latestDek'     => array( 'Description (optional)', 'textarea', '' ),
				'latestMore'    => array( 'Link on the right', 'text', 'View all →' ),
			),
		),

		'newsletter' => array(
			'title'  => 'Newsletter block',
			'fields' => array(
				'newsletterEyebrow'     => array( 'Small label', 'text', 'Newsletter' ),
				'newsletterHeading'     => array( 'Heading', 'text', 'One tested guide, every Tuesday' ),
				'newsletterDek'         => array( 'Description', 'textarea', 'No launch roundups, no “top 50” lists. One thing we actually used, with what went wrong.' ),
				'newsletterPlaceholder' => array( 'Email box placeholder', 'text', 'you@work.com' ),
				'newsletterButton'      => array( 'Button label', 'text', 'Subscribe' ),
				'newsletterFinePrint'   => array( 'Line under the form', 'textarea', 'Free. Unsubscribe in one click. We never sell your address.' ),
				'newsletterSuccess'     => array( 'Message after signing up', 'text', 'You are on the list. First guide lands Tuesday.' ),
			),
		),

		'trending' => array(
			'title'  => 'Trending ticker',
			'fields' => array(
				'trendingLabel' => array( 'Accessible label', 'text', 'Trending now' ),
			),
		),

		'states' => array(
			'title'  => 'Empty and error messages',
			'fields' => array(
				'emptyCategory'  => array( 'Section with no posts yet', 'textarea', 'Nothing published in this section yet. The first guide lands soon.' ),
				'emptyLatest'    => array( 'No posts at all', 'textarea', 'No guides yet. This is where they will appear.' ),
				'emptySearch'    => array( 'No search results', 'textarea', 'No guide matches that. Try a broader term.' ),
				'notFoundHeading' => array( '404 heading', 'text', 'That page is not here' ),
				'notFoundDek'    => array( '404 description', 'textarea', 'The link may be old, or the guide may have been renamed after a re-test. The six sections below all still work.' ),
			),
		),

		'footer' => array(
			'title'  => 'Footer column headings',
			'fields' => array(
				'footerTopics' => array( 'First column', 'text', 'Topics' ),
				'footerSite'   => array( 'Second column', 'text', 'Site' ),
				'footerLegal'  => array( 'Third column', 'text', 'Legal' ),
			),
		),
	);
}

/** Flat map of key => default. */
function thd_content_defaults() {
	$out = array();
	foreach ( thd_content_fields() as $group ) {
		foreach ( $group['fields'] as $key => $spec ) {
			$out[ $key ] = $spec[2];
		}
	}
	return $out;
}

/** Saved values merged over the defaults, so a blank field falls back. */
function thd_content_values() {
	$saved    = get_option( 'thd_site_content', array() );
	$defaults = thd_content_defaults();
	$out      = array();
	foreach ( $defaults as $key => $default ) {
		$val        = isset( $saved[ $key ] ) ? trim( (string) $saved[ $key ] ) : '';
		$out[ $key ] = ( '' === $val ) ? $default : $val;
	}
	return $out;
}

/* ---------------------------------------------------------------- admin */

add_action(
	'admin_menu',
	function () {
		add_options_page(
			'Site Content',
			'Site Content',
			'manage_options',
			'thd-site-content',
			'thd_content_page'
		);
	}
);

add_action(
	'admin_init',
	function () {
		register_setting(
			'thd_site_content_group',
			'thd_site_content',
			array(
				'sanitize_callback' => function ( $input ) {
					$clean = array();
					foreach ( thd_content_defaults() as $key => $_ ) {
						if ( isset( $input[ $key ] ) ) {
							$clean[ $key ] = sanitize_textarea_field( wp_unslash( $input[ $key ] ) );
						}
					}
					return $clean;
				},
			)
		);
	}
);

function thd_content_page() {
	$values = get_option( 'thd_site_content', array() );
	?>
	<div class="wrap">
		<h1>Site Content</h1>
		<p>Every fixed piece of wording on the website. Leave a field empty to
		use its default. Changes appear on the site within a few seconds.</p>
		<p><strong>Category names and descriptions are not here.</strong> Edit
		those at <a href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=category' ) ); ?>">Posts → Categories</a>
		— the front end reads each section's heading and description straight
		from there.</p>

		<form method="post" action="options.php">
			<?php settings_fields( 'thd_site_content_group' ); ?>

			<?php foreach ( thd_content_fields() as $group ) : ?>
				<h2><?php echo esc_html( $group['title'] ); ?></h2>
				<table class="form-table" role="presentation">
					<?php foreach ( $group['fields'] as $key => $spec ) : ?>
						<?php
						list( $label, $type, $default ) = $spec;
						$val = isset( $values[ $key ] ) ? $values[ $key ] : '';
						?>
						<tr>
							<th scope="row">
								<label for="thd_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label>
							</th>
							<td>
								<?php if ( 'textarea' === $type ) : ?>
									<textarea id="thd_<?php echo esc_attr( $key ); ?>"
										name="thd_site_content[<?php echo esc_attr( $key ); ?>]"
										rows="2" class="large-text"
										placeholder="<?php echo esc_attr( $default ); ?>"><?php echo esc_textarea( $val ); ?></textarea>
								<?php else : ?>
									<input type="text" id="thd_<?php echo esc_attr( $key ); ?>"
										name="thd_site_content[<?php echo esc_attr( $key ); ?>]"
										value="<?php echo esc_attr( $val ); ?>"
										class="regular-text"
										placeholder="<?php echo esc_attr( $default ); ?>">
								<?php endif; ?>
								<p class="description">Default: <?php echo esc_html( $default ? $default : '(none)' ); ?></p>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endforeach; ?>

			<?php submit_button( 'Save and refresh the site' ); ?>
		</form>
	</div>
	<?php
}

/* ------------------------------------------------------------- graphql */

add_action(
	'graphql_register_types',
	function () {
		$fields = array();
		foreach ( thd_content_defaults() as $key => $_ ) {
			$fields[ $key ] = array(
				'type'        => 'String',
				'description' => 'Editable at Settings → Site Content',
			);
		}

		register_graphql_object_type(
			'SiteContent',
			array(
				'description' => 'Editable site-wide copy.',
				'fields'      => $fields,
			)
		);

		register_graphql_field(
			'RootQuery',
			'siteContent',
			array(
				'type'        => 'SiteContent',
				'description' => 'All editable copy for the front end.',
				'resolve'     => function () {
					return thd_content_values();
				},
			)
		);
	}
);

/* Saving the settings refreshes the whole site. */
add_action(
	'update_option_thd_site_content',
	function () {
		if ( function_exists( 'thd_revalidate_endpoint' ) && defined( 'THD_REVALIDATE_SECRET' ) ) {
			wp_remote_post(
				thd_revalidate_endpoint(),
				array(
					'timeout'  => 8,
					'blocking' => false,
					'headers'  => array( 'Content-Type' => 'application/json' ),
					'body'     => wp_json_encode( array( 'secret' => THD_REVALIDATE_SECRET ) ),
				)
			);
		}
	}
);
