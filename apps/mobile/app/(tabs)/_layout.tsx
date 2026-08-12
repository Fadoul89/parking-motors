import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Rechercher" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favoris" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Mes annonces" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
