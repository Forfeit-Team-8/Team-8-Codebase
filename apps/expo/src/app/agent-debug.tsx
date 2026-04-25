import { useMemo, useReducer, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";

import type { RouterInputs } from "~/utils/api";
import { trpc } from "~/utils/api";

/**
 * STUB DEBUG PAGE — for trying the verification agent end-to-end without
 * wiring the real goal-creation / payment / verdict-screen flow.
 *
 * Photo flow: pick photo via expo-image-picker → upload base64 to the server
 * via evidence.uploadPhoto (which forwards to the Anthropic Files API and
 * returns a file_id) → pass that file_id as evidence to verdict.run.
 */

type Evidence = RouterInputs["verdict"]["run"]["evidence"][number];
type Kind = Evidence["kind"];

type Action = { kind: "reset" } | { kind: "append"; event: unknown };

interface State {
  events: unknown[];
}

const initial: State = { events: [] };

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "reset":
      return { events: [] };
    case "append":
      return { events: [...state.events, action.event] };
  }
}

interface PickedPhoto {
  uri: string;
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

export default function AgentDebug() {
  const [title, setTitle] = useState("Run 5km this week");
  const [description, setDescription] = useState(
    "Verify a Strava activity at the URL below.",
  );
  const [stake, setStake] = useState("10");
  const [ngo, setNgo] = useState("Voedselbank Amsterdam");
  const [evidenceKind, setEvidenceKind] = useState<Kind>("url");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [photoFileId, setPhotoFileId] = useState<string | null>(null);

  const [{ events }, dispatch] = useReducer(reducer, initial);
  const [enabled, setEnabled] = useState(false);

  const deadlineIso = useMemo(() => new Date().toISOString(), []);

  const uploadPhoto = useMutation(
    trpc.evidence.uploadPhoto.mutationOptions({
      onSuccess: ({ fileId }) => setPhotoFileId(fileId),
    }),
  );

  const evidence = useMemo<Evidence[]>(() => {
    if (evidenceKind === "url" && evidenceUrl.trim().length > 0) {
      return [
        { kind: "url", url: evidenceUrl.trim(), note: evidenceNote || undefined },
      ];
    }
    if (evidenceKind === "photo" && photoFileId) {
      return [
        {
          kind: "photo",
          fileId: photoFileId,
          note: evidenceNote || undefined,
        },
      ];
    }
    if (evidenceKind === "text" && evidenceText.trim().length > 0) {
      return [{ kind: "text", text: evidenceText.trim() }];
    }
    return [];
  }, [evidenceKind, evidenceUrl, evidenceText, evidenceNote, photoFileId]);

  const subscription = useSubscription(
    trpc.verdict.run.subscriptionOptions(
      {
        goal: {
          title,
          description: description || undefined,
          deadline: deadlineIso,
          stakeAmountCents: Math.max(1, Number(stake) || 0) * 100,
          ngoName: ngo,
        },
        evidence,
      },
      {
        enabled,
        onData: (event) => dispatch({ kind: "append", event }),
        onError: (err) =>
          dispatch({
            kind: "append",
            event: { type: "error", message: err.message },
          }),
      },
    ),
  );

  const onPickPhoto = async () => {
    setPhotoFileId(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      dispatch({
        kind: "append",
        event: {
          type: "error",
          message: "Photo library permission denied.",
        },
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    const mediaType = mimeFromAsset(asset);
    const next: PickedPhoto = {
      uri: asset.uri,
      base64: asset.base64,
      mediaType,
    };
    setPhoto(next);
    uploadPhoto.mutate({ base64: next.base64, mediaType: next.mediaType });
  };

  const onRun = () => {
    dispatch({ kind: "reset" });
    setEnabled(true);
  };

  const onStop = () => setEnabled(false);

  const photoUploadStatus = uploadPhoto.isPending
    ? "Uploading…"
    : uploadPhoto.isError
      ? `Upload failed: ${uploadPhoto.error.message}`
      : photoFileId
        ? "Uploaded ✓"
        : "Ready to upload.";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1 }}
      className="bg-background"
    >
      <Stack.Screen options={{ title: "Agent Debug" }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-foreground pb-2 text-2xl font-bold">
          Verification agent
        </Text>
        <Text className="text-muted-foreground pb-4 text-sm">
          STUB UI — not styled, not auth-gated, no DB persistence. Type a goal,
          submit evidence, watch the agent stream its reasoning.
        </Text>

        <Section label="Goal title">
          <TextInput
            className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
            value={title}
            onChangeText={setTitle}
            placeholder="Run 5km this week"
          />
        </Section>

        <Section label="Description (optional)">
          <TextInput
            className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </Section>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Section label="Stake (€)">
              <TextInput
                className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
                value={stake}
                onChangeText={setStake}
                keyboardType="numeric"
              />
            </Section>
          </View>
          <View className="flex-1">
            <Section label="NGO if forfeited">
              <TextInput
                className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
                value={ngo}
                onChangeText={setNgo}
              />
            </Section>
          </View>
        </View>

        <Section label="Evidence kind">
          <View className="flex-row gap-2">
            {(["url", "photo", "text"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setEvidenceKind(k)}
                className={`flex-1 rounded-md border px-3 py-2 ${
                  evidenceKind === k
                    ? "border-primary bg-primary"
                    : "border-input bg-background"
                }`}
              >
                <Text className="text-foreground text-center font-semibold">
                  {k}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {evidenceKind === "url" ? (
          <>
            <Section label="URL">
              <TextInput
                className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
                value={evidenceUrl}
                onChangeText={setEvidenceUrl}
                autoCapitalize="none"
                placeholder="https://www.strava.com/activities/..."
              />
            </Section>
            <Section label="Note (optional)">
              <TextInput
                className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
                value={evidenceNote}
                onChangeText={setEvidenceNote}
              />
            </Section>
          </>
        ) : evidenceKind === "photo" ? (
          <>
            <Section label="Photo">
              <Pressable
                onPress={onPickPhoto}
                className="border-input bg-background rounded-md border px-4 py-3"
              >
                <Text className="text-foreground text-center font-semibold">
                  {photo ? "Change photo" : "Pick photo from library"}
                </Text>
              </Pressable>
              {photo ? (
                <View className="mt-2 flex-row gap-3">
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: 96, height: 96, borderRadius: 8 }}
                  />
                  <View className="flex-1 justify-center">
                    <Text className="text-muted-foreground text-xs">
                      {photoUploadStatus}
                    </Text>
                    {photoFileId ? (
                      <Text
                        className="text-muted-foreground text-xs"
                        numberOfLines={1}
                      >
                        file_id: {photoFileId}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </Section>
            <Section label="Note (optional)">
              <TextInput
                className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
                value={evidenceNote}
                onChangeText={setEvidenceNote}
              />
            </Section>
          </>
        ) : (
          <Section label="Text evidence">
            <TextInput
              className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-base"
              value={evidenceText}
              onChangeText={setEvidenceText}
              multiline
            />
          </Section>
        )}

        <View className="mt-4 flex-row gap-2">
          <Pressable
            onPress={onRun}
            disabled={
              (enabled && subscription.status !== "error") ||
              (evidenceKind === "photo" && !photoFileId)
            }
            className={`bg-primary flex-1 rounded-md px-4 py-3 ${
              (enabled && subscription.status !== "error") ||
              (evidenceKind === "photo" && !photoFileId)
                ? "opacity-60"
                : ""
            }`}
          >
            <Text className="text-foreground text-center font-bold">
              Run agent
            </Text>
          </Pressable>
          <Pressable
            onPress={onStop}
            disabled={!enabled}
            className="border-input bg-background rounded-md border px-4 py-3"
          >
            <Text className="text-foreground text-center font-bold">Stop</Text>
          </Pressable>
        </View>

        <View className="mt-2">
          <Text className="text-muted-foreground text-xs">
            status: {String(subscription.status)}
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-foreground pb-2 text-lg font-semibold">
            Stream
          </Text>
          {events.length === 0 ? (
            <Text className="text-muted-foreground text-sm italic">
              (no events yet — tap Run agent)
            </Text>
          ) : (
            events.map((ev, i) => <EventRow key={i} event={ev} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section(props: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-3">
      <Text className="text-foreground pb-1 text-sm font-semibold">
        {props.label}
      </Text>
      {props.children}
    </View>
  );
}

function mimeFromAsset(
  asset: ImagePicker.ImagePickerAsset,
): PickedPhoto["mediaType"] {
  // expo-image-picker returns asset.mimeType on newer SDKs; fall back to URI
  // suffix for older ones. STUB: limited to the four types Anthropic vision
  // accepts.
  const mime = asset.mimeType?.toLowerCase();
  if (mime === "image/png") return "image/png";
  if (mime === "image/webp") return "image/webp";
  if (mime === "image/gif") return "image/gif";
  if (mime === "image/jpeg" || mime === "image/jpg") return "image/jpeg";
  const lowerUri = asset.uri.toLowerCase();
  if (lowerUri.endsWith(".png")) return "image/png";
  if (lowerUri.endsWith(".webp")) return "image/webp";
  if (lowerUri.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function EventRow({ event }: { event: unknown }) {
  if (!event || typeof event !== "object") {
    return <Text className="text-foreground text-xs">{String(event)}</Text>;
  }

  const e = event as { type?: string; [k: string]: unknown };

  switch (e.type) {
    case "thinking_delta":
      return (
        <Text className="text-muted-foreground py-0.5 text-sm italic">
          🧠 {String(e.delta)}
        </Text>
      );
    case "text_delta":
      return (
        <Text className="text-foreground py-0.5 text-sm">
          {String(e.delta)}
        </Text>
      );
    case "tool_use":
      return (
        <View className="my-1 rounded border border-blue-500/40 bg-blue-500/10 p-2">
          <Text className="text-foreground text-sm font-semibold">
            🔧 tool_use → {String(e.toolName)}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {JSON.stringify(e.input, null, 2)}
          </Text>
        </View>
      );
    case "tool_result":
      return (
        <View
          className={`my-1 rounded border p-2 ${
            e.isError
              ? "border-destructive/40 bg-destructive/10"
              : "border-green-500/40 bg-green-500/10"
          }`}
        >
          <Text className="text-foreground text-sm font-semibold">
            {e.isError ? "❌" : "✅"} tool_result ← {String(e.toolName)}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {String(e.result).slice(0, 600)}
          </Text>
        </View>
      );
    case "verdict": {
      const verdict = e.verdict as { status?: string };
      return (
        <View className="my-2 rounded border-2 border-primary bg-primary/10 p-3">
          <Text className="text-foreground text-lg font-bold">
            🏛 VERDICT: {String(verdict.status)}
          </Text>
          <Text className="text-foreground text-sm">
            {JSON.stringify(e.verdict, null, 2)}
          </Text>
        </View>
      );
    }
    case "error":
      return (
        <View className="my-1 rounded border border-destructive/40 bg-destructive/10 p-2">
          <Text className="text-destructive text-sm font-semibold">
            ❌ {String(e.message)}
          </Text>
        </View>
      );
    default:
      return (
        <Text className="text-muted-foreground py-0.5 text-xs">
          {JSON.stringify(event)}
        </Text>
      );
  }
}
