<?php 



add_action("init",function() {
    $plugin_dir_url = plugin_dir_url(__FILE__);

    $shortcode = 'SHORTCODE_CODE';
    $my_handle = 'wps-'.$shortcode;

    function SHORTCODE_PREFIX_shortcodeHead($plugin_dir_url) {
        return <<<HTML
            SHORTCODE_HEAD
        HTML;
    }
    
    
    function SHORTCODE_PREFIX_shortcodeBody($id,$attributes, $contents, $plugin_dir_url) {
        $jsonAttributes = json_encode($attributes);
        
        return <<<HTML
            <script id="SHORTCODE_CODE-attributes-{$id}" type="application/json">
                {$jsonAttributes}
            </script>
            <template id="SHORTCODE_CODE-content-{$id}">
                {$contents}
            </template>
            SHORTCODE_SCRIPT
        HTML;
    }
    
    
    add_shortcode("SHORTCODE_CODE", function ($attributes, $content) {        
        $plugin_dir_url = plugin_dir_url(__FILE__);
        $attributes = array_merge(
            ['id' => 'main'], 
            $attributes, 
            [
                'base' => get_permalink(),
                'nonce' => wp_create_nonce('wp_rest')
            ]
        );    
        $id = $attributes['id'];

        $attributes = apply_filters('SHORTCODE_attributes',$attributes,$id);


        $injection = SHORTCODE_PREFIX_shortcodeBody($id,$attributes, $content, $plugin_dir_url);
    
        if (SHORTCODE_SHADOW) {
            $injection .= SHORTCODE_PREFIX_shortcodeHead($plugin_dir_url);
            return <<<HTML
                <template id="SHORTCODE_CODE-template-{$id}">
                    {$injection}
                </template>
                <div id="SHORTCODE_CODE-container-{$id}" data-wps-container="SHORTCODE_CODE"></div>
                <script>
                    document
                        .querySelector("#SHORTCODE_CODE-container-{$id}")
                        .attachShadow({ mode: "open" })
                        .appendChild(document.querySelector("#SHORTCODE_CODE-template-{$id}").content)
                </script>
             HTML;
        } else {
            return $injection;
        }
    });    
    add_action("wp_head", function () {
        if (SHORTCODE_SHADOW) return;
    
        global $post;
        if (!has_shortcode($post->post_content, "SHORTCODE_CODE")) return;
    
        $plugin_dir_url = plugin_dir_url(__FILE__);
        echo SHORTCODE_PREFIX_shortcodeHead($plugin_dir_url);
    },99);

    add_action("wp_footer", function () {
    
        $plugin_dir_url = plugin_dir_url(__FILE__);
        
        echo 
        <<<HTML
            SHORTCODE_FOOTER
        HTML;
    },99);
});






?>
