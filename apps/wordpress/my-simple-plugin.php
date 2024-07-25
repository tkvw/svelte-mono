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