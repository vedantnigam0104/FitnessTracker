package com.ved.TradePulse.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class NutritionController {

    @Value("${nutritionix.appId}")
    private String appId;

    @Value("${nutritionix.apiKey}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/api/nutrition/search")
    public ResponseEntity<?> searchNutrition(@RequestParam String query) {
        try {
            String url = "https://trackapi.nutritionix.com/v2/natural/nutrients";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-app-id", appId);
            headers.set("x-app-key", apiKey);

            // JSON body with query param
            String jsonBody = "{\"query\":\"" + query + "\"}";

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // Parse response JSON
            JsonNode root = objectMapper.readTree(response.getBody());

            // The response contains a 'foods' array with nutrition details
            if (root.has("foods") && root.get("foods").isArray() && root.get("foods").size() > 0) {
                JsonNode food = root.get("foods").get(0);

                // Extract nutrition info
                String foodName = food.get("food_name").asText();
                int calories = food.get("nf_calories").asInt(0);
                double protein = food.get("nf_protein").asDouble(0.0);
                double carbs = food.get("nf_total_carbohydrate").asDouble(0.0);
                double fats = food.get("nf_total_fat").asDouble(0.0);
                double servingQty = food.get("serving_qty").asDouble(0.0);
                String servingUnit = food.get("serving_unit").asText();

                ObjectNode result = objectMapper.createObjectNode();
                result.put("foodName", foodName);
                result.put("calories", calories);
                result.put("protein", protein);
                result.put("carbs", carbs);
                result.put("fats", fats);
                result.put("servingQty", servingQty);
                result.put("servingUnit", servingUnit);

                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No nutrition info found for the query");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch nutrition data");
        }
    }
}
