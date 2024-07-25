<?php 

function SHORTCODE_PREFIX_shortcodeHead() {
    return <<<HTML
        SHORTCODE_HEAD
    HTML;
}


function SHORTCODE_PREFIX_shortcodeBody($attributes, $contents) {
    $jsonAttributes = json_encode($attributes);
    return <<<HTML
        SHORTCODE_SCRIPT
    HTML;
}


add_shortcode("SHORTCODE_CODE", function ($attributes, $content) {
    $injection = SHORTCODE_PREFIX_shortcodeBody($attributes, $content);

    if (SHORTCODE_SHADOW) {
        $injection .= SHORTCODE_PREFIX_shortcodeHead();
        return <<<HTML
            <template id="SHORTCODE_CODE-template">
                {$injection}
            </template>
            <div id="SHORTCODE_CODE-container"></div>
            <script>
                document
                    .querySelector("#SHORTCODE_CODE-container")
                    .attachShadow({ mode: "open" })
                    .appendChild(document.querySelector("#SHORTCODE_CODE-template").content)
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

    echo SHORTCODE_PREFIX_shortcodeHead();
});

?>
