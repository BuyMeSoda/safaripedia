import { useMutation } from "@tanstack/react-query";
import { api, type GenerateInput, type GenerateResponse } from "@shared/routes";

export function useGenerate() {
  return useMutation({
    mutationFn: async (data: GenerateInput): Promise<GenerateResponse> => {
      // Validate input against schema before sending
      const validatedInput = api.generate.input.parse(data);

      const res = await fetch(api.generate.path, {
        method: api.generate.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedInput),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
          const error = api.generate.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate response. Please try again.");
      }

      const json = await res.json();
      return api.generate.responses[200].parse(json);
    },
  });
}
