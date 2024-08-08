<?php 


function SHORTCODE_PREFIX_shortcodeBody($attributes, $content) {
    $jsonAttributes = json_encode($attributes);
    
    return <<<HTML
        <script id="SHORTCODE_CODE-attributes" type="application/json">
            {$jsonAttributes}
        </script>
        <template id="SHORTCODE_CODE-content">
            {$content}
        </template>
        <div id="app"></div>
        SHORTCODE_SCRIPT
    HTML;
}


add_shortcode("SHORTCODE_CODE", function ($attributes, $content) {
    $injection = SHORTCODE_PREFIX_shortcodeBody($attributes, $content);

    if (SHORTCODE_SHADOW) {
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
?>
