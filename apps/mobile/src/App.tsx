import React, { useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";

const API_BASE_URL = "http://localhost:3001/api";

async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed (${res.status})`);
  }
  return (await res.json()) as {
    tokens: { accessToken: string };
    user: { full_name: string; email: string; user_type: string };
  };
}

function LoginScreen({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      const res = await loginRequest(email, password);
      onLoggedIn(res.tokens.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <View style={{ width: "100%", maxWidth: 400 }}>
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 16 }}>
          IEC Hub Mobile Login
        </Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            padding: 8,
            marginBottom: 8
          }}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            padding: 8,
            marginBottom: 8
          }}
        />
        {error && (
          <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
        )}
        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  title,
  active,
  onPress
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      title={title + (active ? " ●" : "")}
      onPress={onPress}
      color={active ? "#2563eb" : "#6b7280"}
    />
  );
}

function ProfileScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Profile</Text>
      <Text style={{ marginTop: 8 }}>This is a placeholder profile view.</Text>
    </View>
  );
}

function ProjectsScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>My Projects</Text>
      <Text style={{ marginTop: 8 }}>
        Skeleton screen – call /api/projects?owner=me here.
      </Text>
    </View>
  );
}

function DiscoverScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Discover</Text>
      <Text style={{ marginTop: 8 }}>
        Skeleton screen – call /api/discover/projects here.
      </Text>
    </View>
  );
}

function MatchesScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>My Matches</Text>
      <Text style={{ marginTop: 8 }}>
        Skeleton screen – call /api/matching/matches here.
      </Text>
    </View>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"profile" | "projects" | "discover" | "matches">(
    "profile"
  );

  let content: React.ReactNode = null;
  if (tab === "profile") content = <ProfileScreen />;
  if (tab === "projects") content = <ProjectsScreen />;
  if (tab === "discover") content = <DiscoverScreen />;
  if (tab === "matches") content = <MatchesScreen />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{content}</View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 8,
          borderTopWidth: 1,
          borderColor: "#e5e7eb"
        }}
      >
        <TabButton
          title="Profile"
          active={tab === "profile"}
          onPress={() => setTab("profile")}
        />
        <TabButton
          title="Projects"
          active={tab === "projects"}
          onPress={() => setTab("projects")}
        />
        <TabButton
          title="Discover"
          active={tab === "discover"}
          onPress={() => setTab("discover")}
        />
        <TabButton
          title="Matches"
          active={tab === "matches"}
          onPress={() => setTab("matches")}
        />
        <Button title="Logout" onPress={onLogout} color="#ef4444" />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  if (!token) {
    return (
      <LoginScreen
        onLoggedIn={(t) => {
          setToken(t);
        }}
      />
    );
  }

  return <MainTabs onLogout={() => setToken(null)} />;
}

