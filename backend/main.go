package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/hello", helloHandler)

	log.Println("Backend server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{
		Status:  "ok",
		Message: "Backend is running",
	})
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Hello from Jones County XC backend!",
	})
}
