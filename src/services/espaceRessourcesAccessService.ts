import { API_BASE_URL } from "../config/api";

type ValidateResponse = {
  success: boolean;
  valid?: boolean;
  message?: string;
  error?: string;
};

export async function validateEspaceRessourcesAccessCode(
  code: string
): Promise<boolean | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/espace-ressources-settings/validate-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) return null;

    const result = (await response.json()) as ValidateResponse;
    if (result.success && typeof result.valid === "boolean") return result.valid;

    return null;
  } catch {
    return null;
  }
}

export async function validateEspaceRessourcesBonusCode(
  code: string
): Promise<boolean | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/espace-ressources-settings/validate-bonus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) return null;

    const result = (await response.json()) as ValidateResponse;
    if (result.success && typeof result.valid === "boolean") return result.valid;

    return null;
  } catch {
    return null;
  }
}
