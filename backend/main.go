package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

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

type CreateAthleteRequest struct {
	Name           string `json:"name" binding:"required"`
	Grade          int32  `json:"grade" binding:"required"`
	PersonalRecord string `json:"personalRecord"`
	Events         string `json:"events"`
}

type CreateMeetRequest struct {
	Name        string `json:"name" binding:"required"`
	Date        string `json:"date" binding:"required"`
	Location    string `json:"location" binding:"required"`
	Description string `json:"description"`
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

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "jones_county_xc")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?parseTime=true", dbUser, dbPassword, dbHost, dbName)
	conn, err := sql.Open("mysql", dsn)
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

	// Create a new athlete
	r.POST("/api/athletes", func(c *gin.Context) {
		var req CreateAthleteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := queries.CreateAthlete(context.Background(), db.CreateAthleteParams{
			Name:           req.Name,
			Grade:          req.Grade,
			PersonalRecord: sql.NullString{String: req.PersonalRecord, Valid: req.PersonalRecord != ""},
			Events:         sql.NullString{String: req.Events, Valid: req.Events != ""},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Athlete created successfully"})
	})

	// Update an athlete
	r.PUT("/api/athletes/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid athlete ID"})
			return
		}

		var req CreateAthleteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = queries.UpdateAthlete(context.Background(), db.UpdateAthleteParams{
			ID:             int32(id),
			Name:           req.Name,
			Grade:          req.Grade,
			PersonalRecord: sql.NullString{String: req.PersonalRecord, Valid: req.PersonalRecord != ""},
			Events:         sql.NullString{String: req.Events, Valid: req.Events != ""},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Athlete updated successfully"})
	})

	// Delete an athlete
	r.DELETE("/api/athletes/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid athlete ID"})
			return
		}

		err = queries.DeleteAthlete(context.Background(), int32(id))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Athlete deleted successfully"})
	})

	// Create a new meet
	r.POST("/api/meets", func(c *gin.Context) {
		var req CreateMeetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		date, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
			return
		}

		result, err := queries.CreateMeet(context.Background(), db.CreateMeetParams{
			Name:        req.Name,
			Date:        date,
			Location:    req.Location,
			Description: sql.NullString{String: req.Description, Valid: req.Description != ""},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Meet created successfully"})
	})

	// Update a meet
	r.PUT("/api/meets/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meet ID"})
			return
		}

		var req CreateMeetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		date, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
			return
		}

		err = queries.UpdateMeet(context.Background(), db.UpdateMeetParams{
			ID:          int32(id),
			Name:        req.Name,
			Date:        date,
			Location:    req.Location,
			Description: sql.NullString{String: req.Description, Valid: req.Description != ""},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Meet updated successfully"})
	})

	// Delete a meet
	r.DELETE("/api/meets/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meet ID"})
			return
		}

		err = queries.DeleteMeet(context.Background(), int32(id))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Meet deleted successfully"})
	})

	// Update a result
	r.PUT("/api/results/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid result ID"})
			return
		}

		var req CreateResultRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = queries.UpdateResult(context.Background(), db.UpdateResultParams{
			ID:        int32(id),
			AthleteID: req.AthleteID,
			MeetID:    req.MeetID,
			Time:      req.Time,
			Place:     req.Place,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Result updated successfully"})
	})

	// Delete a result
	r.DELETE("/api/results/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid result ID"})
			return
		}

		err = queries.DeleteResult(context.Background(), int32(id))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Result deleted successfully"})
	})

	r.Run(":8080")
}
