package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Athlete struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Grade          int    `json:"grade"`
	PersonalRecord string `json:"personalRecord"`
}

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Backend is running",
		})
	})

	r.GET("/api/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Jones County XC backend!",
		})
	})

	r.GET("/api/athletes", func(c *gin.Context) {
		athletes := []Athlete{
			{ID: 1, Name: "Emma Johnson", Grade: 11, PersonalRecord: "18:42"},
			{ID: 2, Name: "Lucas Martinez", Grade: 10, PersonalRecord: "16:55"},
			{ID: 3, Name: "Sophia Chen", Grade: 12, PersonalRecord: "19:15"},
			{ID: 4, Name: "Ethan Williams", Grade: 9, PersonalRecord: "17:30"},
			{ID: 5, Name: "Olivia Brown", Grade: 11, PersonalRecord: "20:05"},
		}
		c.JSON(http.StatusOK, athletes)
	})

	r.Run(":8080")
}
