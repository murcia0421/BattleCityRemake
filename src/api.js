
const API_URL = "http://localhost:8080/api/v1";

export const getAllPlayers = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const createPlayer = async (player) => {
    const response = await fetch(API_URL+'/players', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Solo intenta convertir a JSON si hay contenido
    if (response.status !== 204 && response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
    }

    return null; // Devuelve null si no hay contenido
};

export const updatePlayer = async (id, player) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
  return response.json();
};

export const deletePlayer = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};
