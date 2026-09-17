<?php
/**
 * The only template in this theme, and it should never render.
 *
 * functions.php redirects every front-end request before WordPress gets
 * here. If you are reading this in a browser, the redirect did not fire —
 * check that THD_FRONTEND_URL is set below.
 *
 * @package thd-headless
 */

status_header( 404 );
nocache_headers();
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Headless</title>
<meta name="robots" content="noindex, nofollow">
</head>
<body>
<p>This is the content backend. The website is at
<a href="<?php echo esc_url( thd_frontend_url() ); ?>"><?php echo esc_html( thd_frontend_url() ); ?></a>.</p>
</body>
</html>
