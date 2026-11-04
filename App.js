import React, { useRef, useEffect, useState } from "react";
import {
    StyleSheet,
    Image,
    Text,
    View,
    Platform,
    TouchableOpacity,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import PinturaEditor from "@pqina/react-native-expo-pintura";
import { useAssets } from "expo-asset";
import * as ImagePicker from "expo-image-picker";

import {
    createMarkupEditorToolStyle,
    createMarkupEditorToolStyles,
} from "@pqina/pintura";

const isAssetOfType = (asset, types) => {
    const extension = `${asset}`.split(".").pop();
    if (!extension) {
        return false;
    }
    return types.some((type) => extension.includes(type));
};

const isImage = (asset) => isAssetOfType(asset, ["jpg", "jpeg", "png", "heic"]);

const isVideo = (asset) => isAssetOfType(asset, ["mov", "mp4"]);

export default function App() {
    const [assets, error] = useAssets([require("./assets/image.jpeg")]);

    const [editorEnabled, setEditorEnabled] = useState(true);

    const [editorSource, setEditorSource] = useState(undefined);

    const [editorResult, setEditorResult] = useState(undefined);

    const editorRef = useRef(null);

    const editorResultPlayer = useVideoPlayer(
        isVideo(editorResult) ? editorResult : null,
        (player) => {
            // set player options
        },
    );

    // This requests permission to select media from camera roll
    useEffect(() => {
        (async () => {
            // Not needed on Web
            if (Platform.OS === "web") {
                return;
            }

            // All fine when access granted
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status === "granted") {
                return;
            }

            // Show message if not allowed
            alert("Sorry, we need camera roll permissions to make this work!");
        })();
    }, []);

    return (
        <View style={styles.container}>
            {isImage(editorResult) && (
                <Image style={styles.output} source={{ uri: editorResult }} />
            )}

            {isVideo(editorResult) && (
                <VideoView style={styles.output} player={editorResultPlayer} />
            )}

            {/* The Pintura Editor component */}
            {editorEnabled && (
                <PinturaEditor
                    ref={editorRef}
                    style={styles.editor}
                    styleRules={`.pintura-editor {
                        --color-background: 255, 255, 255;
                        --color-foreground: 0, 0, 0;
                    }`}
                    markupEditorToolStyles={createMarkupEditorToolStyles({
                        text: createMarkupEditorToolStyle("text", {
                            fontSize: "10%",
                        }),
                    })}
                    imageCropAspectRatio={1}
                    src={editorSource}
                    onLoaderror={(err) => {
                        console.log("onLoaderror", err);
                    }}
                    onLoad={({ size }) => {
                        console.log("onLoad", size);
                    }}
                    onProcess={({ dest, imageState }) => {
                        // dest is output file uri
                        console.log("onProcess", dest);

                        // preview
                        setEditorResult(dest);
                    }}
                />
            )}

            <View style={styles.buttonRow}>
                {/* Example removing and adding the editor */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        setEditorEnabled(!editorEnabled);
                    }}
                >
                    <Text style={styles.buttonText}>Toggle</Text>
                </TouchableOpacity>

                {/* Example updating editor image source */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        // load local asset
                        const [image] = assets;
                        setEditorSource(image.localUri);
                    }}
                >
                    <Text style={styles.buttonText}>Test image</Text>
                </TouchableOpacity>

                {/* Example running an editor function */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        // Run editor function
                        editorRef.current.editor.history.undo();
                    }}
                >
                    <Text style={styles.buttonText}>Undo</Text>
                </TouchableOpacity>

                {/* Example selecting a library image */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={async () => {
                        // Use ImagePicker to get a base64 image string
                        const res = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ["images", "videos"],
                            allowsMultipleSelection: false,
                            quality: 1,
                        });

                        const { canceled, assets } = res;
                        if (canceled) {
                            return;
                        }

                        // send first selected asset
                        const [asset] = assets;
                        setEditorSource(asset.uri);
                    }}
                >
                    <Text style={styles.buttonText}>Browse...</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        paddingTop: 65,
        paddingBottom: 25,
        gap: 15,
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-between",
    },
    output: {
        width: "100%",
        height: 100,
        objectFit: "contain",
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 15,
    },
    editor: {
        width: "100%",
        flex: 1,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 15,
        overflow: "hidden",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 1,
        borderRadius: 15,
        overflow: "hidden",
    },
    button: {
        backgroundColor: "#222",
        paddingTop: 5,
        paddingBottom: 5,
        paddingHorizontal: 15,
    },
    buttonText: {
        fontSize: 14,
        color: "#fff",
    },
});
