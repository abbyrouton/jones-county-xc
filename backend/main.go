package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"jones-county-xc/backend/db"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var queries *db.Queries

// Response types for JSON serialization
type AthleteResponse struct {
	ID             int32  `json:"id"`
	Name           string `json:"name"`
	Grade          int32  `json:"grade"`
	PersonalRecord string `json:"personalRecord"`
	Events         string `json:"events"`
}

type MeetResponse struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Date        string `json:"date"`
	Location    string `json:"location"`
	Description string `json:"description"`
}

type ResultResponse struct {
	ID        int32  `json:"id"`
	AthleteID int32  `json:"athleteId"`
	MeetID    int32  `json:"meetId"`
	Time      string `json:"time"`
	Place     int32  `json:"place"`
}

type MeetResultResponse struct {
	ID           int32  `json:"id"`
	Time         string `json:"time"`
	Place        int32  `json:"place"`
	AthleteID    int32  `json:"athleteId"`
	AthleteName  string `json:"athleteName"`
	AthleteGrade int32  `json:"athleteGrade"`
}

type CreateResultRequest struct {
	AthleteID int32  `json:"athleteId" binding:"required"`
	MeetID    int32  `json:"meetId" binding:"required"`
	Time      string `json:"time" binding:"required"`
	Place     int32  `json:"place" binding:"required"`
}

type TopTimeResponse struct {
	ID          int32  `json:"id"`
	Time        string `json:"time"`
	Place       int32  `json:"place"`
	AthleteID   int32  `json:"athleteId"`
	AthleteName string `json:"athleteName"`
	MeetID      int32  `json:"meetId"`
	MeetName    string `json:"meetName"`
	MeetDate    string `json:"meetDate"`
}

func main() {
	conn, err := sql.Open("mysql", "root@tcp(127.0.0.1:3306)/jones_county_xc?parseTime=true")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer conn.Close()

	if err = conn.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	log.Println("Connected to MySQL database")

	queries = db.New(conn)

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

	// Get all athletes
	r.GET("/api/athletes", func(c *gin.Context) {
		athletes, err := queries.GetAllAthletes(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := make([]AthleteResponse, len(athletes))
		for i, a := range athletes {
			response[i] = AthleteResponse{
				ID:             a.ID,
				Name:           a.Name,
				Grade:          a.Grade,
				PersonalRecord: a.PersonalRecord.String,
				Events:         a.Events.String,
			}
		}
		c.JSON(http.StatusOK, response)
	})

	// Get athlete by ID
	r.GET("/api/athletes/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid athlete ID"})
			return
		}

		athlete, err := queries.GetAthleteByID(context.Background(), int32(id))
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Athlete not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, AthleteResponse{
			ID:             athlete.ID,
			Name:           athlete.Name,
			Grade:          athlete.Grade,
			PersonalRecord: athlete.PersonalRecord.String,
			Events:         athlete.Events.String,
		})
	})

	// Get all meets
	r.GET("/api/meets", func(c *gin.Context) {
		meets, err := queries.GetAllMeets(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := make([]MeetResponse, len(meets))
		for i, m := range meets {
			response[i] = MeetResponse{
				ID:          m.ID,
				Name:        m.Name,
				Date:        m.Date.Format("2006-01-02"),
				Location:    m.Location,
				Description: m.Description.String,
			}
		}
		c.JSON(http.StatusOK, response)
	})

	// Get results for a specific meet (with athlete names)
	r.GET("/api/meets/:id/results", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meet ID"})
			return
		}

		results, err := queries.GetMeetResults(context.Background(), int32(id))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := make([]MeetResultResponse, len(results))
		for i, r := range results {
			response[i] = MeetResultResponse{
				ID:           r.ID,
				Time:         r.Time,
				Place:        r.Place,
				AthleteID:    r.AthleteID,
				AthleteName:  r.AthleteName,
				AthleteGrade: r.AthleteGrade,
			}
		}
		c.JSON(http.StatusOK, response)
	})

	// Create a new result
	r.POST("/api/results", func(c *gin.Context) {
		var req CreateResultRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := queries.CreateResult(context.Background(), db.CreateResultParams{
			AthleteID: req.AthleteID,
			MeetID:    req.MeetID,
			Time:      req.Time,
			Place:     req.Place,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{
			"id":      id,
			"message": "Result created successfully",
		})
	})

	// Get top 10 fastest times
	r.GET("/api/top-times", func(c *gin.Context) {
		times, err := queries.GetTopTimes(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := make([]TopTimeResponse, len(times))
		for i, t := range times {
			response[i] = TopTimeResponse{
				ID:          t.ID,
				Time:        t.Time,
				Place:       t.Place,
				AthleteID:   t.AthleteID,
				AthleteName: t.AthleteName,
				MeetID:      t.MeetID,
				MeetName:    t.MeetName,
				MeetDate:    t.MeetDate.Format("2006-01-02"),
			}
		}
		c.JSON(http.StatusOK, response)
	})

	r.Run(":8080")
}
