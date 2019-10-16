# REST API Documentation  
Document explaining how the REST API for the server is used.  
## Login
----
Log in on the server and receive the JWT Token. The token should be in an Authorization header like:
`Authorization: Bearer [token]`
where [token] is the token received in this request.
* **URL**
    `/api/login`
* **Method**
    `POST`
* **Data Params**  
    * **Required:**  
    `"username": [string]`
    `"password": [string]`
    * **Example:**  
    ```json
    {  
	    "username": "johndoe",
        "password": "johnpassword"
    }
    ```
* **Success Response**

## Get all courses
----
Get all available courses.  
* **URL**  
    `/api/courses`  
* **Method**  
    `GET`  
* **Success Response (Courses Found)**  
    * **Code:** 200  
    * **Content:**
    ``
* **Success Response (No courses found)**  
    * **Code**: 204  
    * **Content**: Empty  

## Add a course
----
Add a course to the system.  
* **URL**  
    `/api/courses`  
* **Method**  
    `POST`  
* **Data Params**  
    * **Required:**  
    `"name": [string]`
    * **Example:**  
    ```json
    {  
	    "name": "Spring Boot Course",
    }
    ```
* **Success Response**
    * **Code:** 201
    * **Content:**
    ```json
    {
        "id": 1,
        "name": "Spring Boot Course"
    }
    ```
* **Error Response**  
    * **Code:** 400
    * **Content:**
    ```text
        Validation error: addCourse.course.name: must not be null
    ```
## Add an exercise to a course
----
Adds a new exercise to an existing course.
* **URL**  
    `/api/courses/:id/exercises`
* **Method**  
    `POST`
* **URL Params**
    * **Required:**  
        `id=[integer]`
    * **Example:**  
    `/api/courses/1/exercises`
* **Data Params**  
    * **Required:**
    `"name": [string]`
    * **Example:**  
    ```json
    {  
	    "name": "Spring Boot Exercise 1",
    }
    ```
* **Success Response**
    * **Code:** 201
    * **Content:**
    ```json
    {
        "id": 1,
        "name": "Spring Boot Course",
        "exercises": [
            {
                "id": 2,
                "name": "Spring Boot Exercise 1"
            }
        ]
    }
    ```
* **Error Response**  
    * **Code:** 400
    * **Content:**
    ```text
        Validation error: addExercise.exercise.name: must not be null
    ```
    OR
    * **Code:** 404
    * **Content:**  
    ```text
        Not found: Course not found.
    ```