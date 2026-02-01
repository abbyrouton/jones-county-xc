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

type Meet struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Date     string `json:"date"`
	Location string `json:"location"`
}

type Result struct {
	ID        int    `json:"id"`
	AthleteID int    `json:"athleteId"`
	MeetID    int    `json:"meetId"`
	Time      string `json:"time"`
	Place     int    `json:"place"`
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

	r.GET("/api/meets", func(c *gin.Context) {
		meets := []Meet{
			{ID: 1, Name: "County Championship", Date: "2026-03-15", Location: "Jones County Park"},
			{ID: 2, Name: "Regional Invitational", Date: "2026-03-22", Location: "Riverside Stadium"},
			{ID: 3, Name: "State Qualifier", Date: "2026-04-05", Location: "Capital City Track"},
		}
		c.JSON(http.StatusOK, meets)
	})

	r.GET("/api/results", func(c *gin.Context) {
		results := []Result{
			{ID: 1, AthleteID: 1, MeetID: 1, Time: "19:05", Place: 3},
			{ID: 2, AthleteID: 2, MeetID: 1, Time: "17:12", Place: 1},
			{ID: 3, AthleteID: 3, MeetID: 1, Time: "19:45", Place: 5},
			{ID: 4, AthleteID: 4, MeetID: 1, Time: "17:58", Place: 2},
			{ID: 5, AthleteID: 5, MeetID: 1, Time: "20:30", Place: 8},
		}
		c.JSON(http.StatusOK, results)
	})

	r.Run(":8080")
}
