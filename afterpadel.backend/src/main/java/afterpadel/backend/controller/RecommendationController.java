package afterpadel.backend.controller;

import afterpadel.backend.knowledge.PadelKnowledgeBank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendation")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostMapping
    public Map<String, String> generateRecommendation(
            @RequestBody Map<String, String> request
    ) {
        String challenge = request.getOrDefault("challenge", "").trim();
        String nextFocus = request.getOrDefault("nextFocus", "").trim();

        if (challenge.isEmpty() && nextFocus.isEmpty()) {
            return Map.of(
                    "recommendation",
                    "Record a challenge or goal in your next reflection to receive a personalized suggestion."
            );
        }

        String knowledge = String.join("\n", PadelKnowledgeBank.TOPICS);

        String prompt = """
                You are AfterPadel, a supportive padel reflection assistant.

                Help a recreational padel player choose one practical
                area to work on during their next session.

                PADEL KNOWLEDGE:
                %s

                PLAYER'S REPORTED CHALLENGE:
                %s

                PLAYER'S NEXT-SESSION GOAL:
                %s

                Generate ONE personalized recommendation.

                Requirements:
                - Base the recommendation on the player's actual responses.
                - Prioritize the reported challenge when one is available.
                - Suggest ONE specific technique or simple practice drill.
                - Explain briefly how the player can practice it.
                - Keep the response between 30 and 60 words.
                - Use clear, friendly, conversational language.
                - Avoid unnecessary technical terminology.
                - Do not invent details about the player's performance.
                - Do not claim the player has improved or mastered a skill.
                - Use the knowledge bank as guidance, not as proof
                  of the player's abilities.
                - If the responses are meaningless or unrelated to padel,
                  ask the player to record a specific padel challenge instead.
                - Return only the recommendation.
                """.formatted(
                knowledge,
                challenge.isEmpty() ? "Not provided" : challenge,
                nextFocus.isEmpty() ? "Not provided" : nextFocus
        );

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 250
                )
        );

        Map<?, ?> response = restClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent")
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Gemini returned an empty response.");
        }

        List<?> candidates = (List<?>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no candidates.");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        String recommendation = (String) firstPart.get("text");

        return Map.of("recommendation", recommendation.trim());
    }
}