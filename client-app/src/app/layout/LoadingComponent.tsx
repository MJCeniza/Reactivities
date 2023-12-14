import { Dimmer, Loader } from "semantic-ui-react";

interface Props {
    inverted?: boolean; //true to darken bg; false for light bg
    content?: string; //loading text
}

export default function LoadingComponent({inverted = true, content = 'Loading...'}: Props) {
    return (
        <Dimmer active={true} inverted={inverted}>
            <Loader content={content}/>
        </Dimmer>
    )
}