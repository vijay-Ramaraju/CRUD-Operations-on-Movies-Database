const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbDirectorObjectToResponseGet = (dbDirector) => {
  return {
    directorId: dbDirector.director_id,
    directorName: dbDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const { movieName } = request.body;
  const getMovieQuery = `
        select movie_name FROM movie;`;
  const movie = await db.all(getMovieQuery);
  response.send(
    movie.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createNewQuery = `
INSERT INTO
movie (director_id,movie_name,lead_actor)
VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(createNewQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getBookQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movies = await db.get(getBookQuery);
  response.send(convertDbObjectToResponseObject(movies));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const { directorId, directorName } = request.body;
  const getDirectorQuery = `
        select * FROM director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbDirectorObjectToResponseGet(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuey = `
    SELECT 
    movie_name 
    FROM 
    movie
    WHERE director_id = '${directorId}';`;
  const getMovieName = await db.all(getDirectorsQuey);
  response.send(
    getMovieName.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
