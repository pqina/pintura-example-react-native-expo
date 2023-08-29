import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import PinturaEditor from "@pqina/react-native-expo-pintura";
import { useAssets } from "expo-asset";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import {
  createMarkupEditorToolStyle,
  createMarkupEditorToolStyles,
} from "@pqina/pintura";

const buttonStyle = {
  backgroundColor: "#222",
  paddingTop: 5,
  paddingBottom: 5,
  paddingHorizontal: 15,
  borderRadius: 10,
  marginHorizontal: 5,
};

const buttonTextStyle = {
  fontSize: 14,
  color: "#fff",
};

export default function App() {
  const [assets, error] = useAssets([require("./assets/image.jpeg")]);

  const [editorEnabled, setEditorEnabled] = useState(true);

  const [editorSource, setEditorSource] = useState(undefined);

  const [editorResult, setEditorResult] = useState(undefined);

  const editorRef = useRef(null);

  // This requests permission to select camera roll images
  useEffect(() => {
    (async () => {
      // Not needed on Web
      if (Platform.OS === "web") return;

      // All fine when access granted
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === "granted") return;

      // Show message if not allowed
      alert("Sorry, we need camera roll permissions to make this work!");
    })();
  }, []);

  return (
    <View style={styles.container}>
      {editorResult && (
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: editorResult }}
        />
      )}

      {/* The Pintura Editor component */}
      {editorEnabled && (
        <PinturaEditor
          ref={editorRef}
          style={{
            width: "95%",
            height: "80%",
            borderWidth: 1,
            borderColor: "#eee",
          }}
          styleRules={`
              .pintura-editor {
                  --color-background: 255, 255, 255;
                  --color-foreground: 0, 0, 0;
              }
          `}
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
            // dest is output file in dataURI format
            console.log("onProcess", imageState, "size", dest.length);

            // preview
            setEditorResult(dest);
          }}
        />
      )}

      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {/* Example removing and adding the editor */}
        <TouchableOpacity
          style={buttonStyle}
          onPress={() => {
            setEditorEnabled(!editorEnabled);
          }}
        >
          <Text style={buttonTextStyle}>Toggle</Text>
        </TouchableOpacity>

        {/* Example updating editor image source */}
        <TouchableOpacity
          style={buttonStyle}
          onPress={() => {
            // load local asset
            const [image] = assets;
            const { localUri } = image;
            FileSystem.readAsStringAsync(localUri, {
              encoding: FileSystem.EncodingType.Base64,
            }).then((base64) => {
              setEditorSource(`data:image/jpeg;base64,${base64}`);
            });
          }}
        >
          <Text style={buttonTextStyle}>Test image</Text>
        </TouchableOpacity>

        {/* Example running an editor function */}
        <TouchableOpacity
          style={buttonStyle}
          onPress={() => {
            // Run editor function
            editorRef.current.editor.history.undo();
          }}
        >
          <Text style={buttonTextStyle}>Undo</Text>
        </TouchableOpacity>

        {/* Example selecting a library image */}
        <TouchableOpacity
          style={buttonStyle}
          onPress={async () => {
            // Use ImagePicker to get a base64 image string
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsMultipleSelection: false,
              quality: 1,
              base64: true,
            });

            const { canceled, assets } = res;
            if (canceled) return;
            const [asset] = assets;

            // video to base64
            let base64 = asset.base64;
            let type = "image/jpeg";
            if (!base64) {
              base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              type = "video/mp4";
            }

            // send data url to editor
            setEditorSource(`data:${type};base64,${base64}`);
          }}
        >
          <Text style={buttonTextStyle}>Browse...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
