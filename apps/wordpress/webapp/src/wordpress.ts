import {startProduction} from "@tkvw/vite-plugin-wordpress-shortcode/client"
import App from "./App.svelte"
import "./app.css"


export default startProduction<{nonce:string}>(({shortcode,target,attributes,contents}) => {
    console.log({attributes});
    return new App({
        target,
        props: {
            nonce: attributes!.nonce
        }
    })
})
