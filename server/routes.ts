import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.generate.path, async (req, res) => {
    try {
      const input = api.generate.input.parse(req.body);

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error("❌ ANTHROPIC_API_KEY is missing");
        return res.status(500).json({ message: "ANTHROPIC_API_KEY is not configured" });
      }

      console.log("✅ API key found, calling Anthropic...");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            { role: "user", content: input.prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Anthropic API Error:", errorData);
        return res.status(500).json({ message: "Failed to generate response from Anthropic", detail: errorData });
      }

      const data = await response.json();
      const text = data.content[0].text;
      await storage.createGeneration({ prompt: input.prompt, response: text });
      res.status(200).json({ response: text });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("❌ Caught error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}