<?php
/*
Plugin Name: Mijn Eenvoudige Plugin
Plugin URI: https://voorbeeld.com/mijn-eenvoudige-plugin
Description: Een zeer eenvoudige WordPress plugin voor demonstratiedoeleinden.
Version: 1.0
Author: Jouw Naam
Author URI: https://voorbeeld.com
*/


add_action( 'admin_menu', 'add_php_info_page' );

include_once __DIR__. '/webapp/dist/tkvw-app.php';


// Creates submenu item under Tools
function add_php_info_page() {
    add_submenu_page(
        'tools.php',           // Parent page
        'Xdebug Info',         // Menu title
        'Xdebug Info',         // Page title
        'manage_options',      // user "role"
        'php-info-page',       // page slug
        'php_info_page_body'); // callback function
}

// Page contents on the new submenu item
function php_info_page_body() {
    $messge = '<h2>No Xdebug enabled</h2>';
    if ( function_exists( 'xdebug_info' ) ) {
        xdebug_info();
    } else {
        echo $messge;
    }
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'mijnplugin/v1', '/user/', array(
        'methods' => 'GET',
        'callback' => 'wp_rest_get_user',
        'permission_callback' => function () {
            return current_user_can( 'read' );
        }
    ) );
} );

function wp_rest_get_user( WP_REST_Request $request ) {
    $current_user = wp_get_current_user();
    if ( $current_user->exists() ) {
        return new WP_REST_Response( $current_user, 200 );
    } else {
        return new WP_REST_Response( 'Geen gebruiker gevonden', 404 );
    }
}