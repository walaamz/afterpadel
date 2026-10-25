package afterpadel.backend.controller;

import afterpadel.backend.knowledge.PadelKnowledgeBank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/followup")
@CrossOrigin(origins = "http://localhost:5173")
public class FollowUpController {

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostMapping
    public Map<String, String> generateFollowUp(
            @RequestBody Map<String, String> request
    ) {
        String answer = request.getOrDefault("answer", "").trim();
        String question = request.getOrDefault("question", "").trim();

        if (answer.isEmpty()) {
            return Map.of(
                    "question",
                    "Can you describe a specific moment from your session?"
            );
        }

        String knowledge = String.join("\n", PadelKnowledgeBank.TOPICS);

        String prompt = """
                You are AfterPadel, a supportive padel reflection assistant.

                Your job is to help a player reflect on their own
                performance, not to act as a professional coach.

                Use the padel knowledge below to understand the
                player's response and ask a relevant follow-up.

                PADEL KNOWLEDGE:
                %s

                ORIGINAL REFLECTION QUESTION:
                %s

                PLAYER'S ANSWER:
                %s

                Generate exactly ONE follow-up question.

                Requirements:
                                           - Ask exactly ONE simple, natural follow-up question.
                                           - Keep the question under 15 words.
                                           - Focus on only ONE idea at a time.
                                           - Use simple, everyday language.
                                           - Make the question easy to answer without much thinking.
                                           - Base it directly on what the player actually wrote.
                                           - Do not introduce situations or details the player
                                             did not mention.
                                           - Avoid technical padel terminology unless the player
                                             used it first.
                                           - Do not combine multiple questions into one.
                                           - Do not give advice or coaching instructions.
                                           - Sound like a supportive teammate having a casual
                                             conversation, not a coach conducting an assessment.
                                           - Return only the question.
                                           - The player's answer must be interpreted in the context
                                             of a padel session.
                                           - Emotional responses, confidence, focus, and teamwork
                                             are valid reflection topics even without padel terminology.
                                           - If the answer is clearly unrelated to the session,
                                             meaningless, or only placeholder text such as
                                             "test", "hello", or "new draft", do not ask a
                                             follow-up about that unrelated content.
                                           - Instead, ask one short, friendly question that
                                             redirects the player toward their padel session.
                                           - Keep any redirection simple and nonjudgmental.
                """.formatted(knowledge, question, answer);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.5,
                        "maxOutputTokens", 200
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

        String generatedQuestion = (String) firstPart.get("text");

        return Map.of("question", generatedQuestion.trim());
    }
}