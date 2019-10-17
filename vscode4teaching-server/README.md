# REST API Documentation

Document explaining how the REST API for the server is used.  
Note: All requests can respond with code 401 if the required role isn't fulfilled.

## Login

---

Log in on the server and receive the JWT Token. The token should be in an Authorization header like:
`Authorization: Bearer [token]`
where [token] is the token received in this request.

- **Required role:**  
   None
- **URL**  
   `/api/login`
- **Method**  
   `POST`
- **Data Params**
  - **Required:**  
    `"username": [string]`  
    `"password": [string]`
  - **Example:**
  ```json
  {
    "username": "johndoe",
    "password": "johnpassword"
  }
  ```
- **Success Response**
  - **Code:** 200
  - **Content:**
  ```json
  {
    "jwtToken": [token]
  }
  ```
- **Error Response**
  - **Code:** 401
  - **Content:**
  ```text
  Invalid credentials: Bad credentials
  ```

## Register a new student

---

Register a new user as a student.

- **Required role:**  
   None
- **URL**  
   `/api/register`
- **Method**  
   `POST`
- **Data Params**
  - **Required:**  
    `"email": [string]` - valid email, unique  
    `"username": [string]` - Between 4 and 50 characters, unique  
    `"password": [string]` - Longer than 8 characters  
    `"name": [string]`  
    `"lastName": [string]`
  - **Example:**
  ```json
  {
    "email": "johndoe@john.com",
    "username": "johndoe",
    "password": "johnpassword",
    "name": "John",
    "lastName": "Doe"
  }
  ```
- **Success Response**
  - **Code:** 201
  - **Content:**
  ```json
  {
    "id": 23,
    "email": "johndoe@john.com",
    "username": "johndoe",
    "name": "John",
    "lastName": "Doe",
    "roles": [
      {
        "roleName": "ROLE_STUDENT"
      }
    ]
  }
  ```
- **Error response**
  - **Code:** 400
  - **Content**
  ```json
  {
    "errors": [
      {
        "fieldName": "lastName",
        "message": "Please provide your last name"
      },
      {
        "fieldName": "email",
        "message": "Please provide an email"
      },
      {
        "fieldName": "name",
        "message": "Please provide your name"
      }
    ]
  }
  ```
  OR
  - **Code:** 400
  - **Content**
  ```text
  Duplicate entry 'johndoe'.
  ```

## Register a new teacher

---

Register a new user as a teacher.

- **Required role:**  
   Teacher
- **URL**  
   `/api/teachers/register`
- **Method**  
   `POST`
- **Data Params**
  - **Required:**  
    `"email": [string]` - valid email, unique  
    `"username": [string]` - Between 4 and 50 characters, unique  
    `"password": [string]` - Longer than 8 characters  
    `"name": [string]`  
    `"lastName": [string]`
  - **Example:**
  ```json
  {
    "email": "johndoe@john.com",
    "username": "johndoe",
    "password": "johnpassword",
    "name": "John",
    "lastName": "Doe"
  }
  ```
- **Success Response**
  - **Code:** 201
  - **Content:**
  ```json
  {
    "id": 23,
    "email": "johndoe@john.com",
    "username": "johndoe",
    "name": "John",
    "lastName": "Doe",
    "roles": [
      {
        "roleName": "ROLE_STUDENT"
      },
      {
        "roleName": "ROLE_TEACHER"
      }
    ]
  }
  ```
- **Error response**
  - **Code:** 400
  - **Content**
  ```json
  {
    "errors": [
      {
        "fieldName": "lastName",
        "message": "Please provide your last name"
      },
      {
        "fieldName": "email",
        "message": "Please provide an email"
      },
      {
        "fieldName": "name",
        "message": "Please provide your name"
      }
    ]
  }
  ```
  OR
  - **Code:** 400
  - **Content**
  ```text
  Duplicate entry 'johndoe'.
  ```

## Get all courses

---

Get all available courses.

- **Required role:**  
   Student
- **URL**  
   `/api/courses`
- **Method**  
   `GET`
- **Success Response (Courses Found)**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "name": "Spring Boot Course"
    },
    {
      "id": 2,
      "name": "Angular Course"
    },
    {
      "id": 3,
      "name": "VSCode Extension API Course"
    }
  ]
  ```
- **Success Response (No courses found)**
  - **Code**: 204
  - **Content**: Empty

## Add a course

---

Add a course to the system. Saves the course in the name of the current logged in teacher.

- **Required role:**  
   Teacher
- **URL**  
   `/api/courses`
- **Method**  
   `POST`
- **Data Params**
  - **Required:**  
    `"name": [string]` - Between 10 and 100 characters
  - **Example:**
  ```json
  {
    "name": "Spring Boot Course"
  }
  ```
- **Success Response**
  - **Code:** 201
  - **Content:**
  ```json
  {
    "id": 1,
    "name": "Spring Boot Course"
  }
  ```
- **Error Response**
  - **Code:** 400
  - **Content:**
  ```json
  {
    "errors": [
      {
        "errors": [
          {
            "fieldName": "name",
            "message": "Course name should be between 10 and 100 characters"
          },
          {
            "fieldName": "name",
            "message": "Name cannot be null"
          }
        ]
      }
    ]
  }
  ```

## Add an exercise to a course

---

Adds a new exercise to an existing course.

- **Required role:**  
   Teacher
- **URL**  
   `/api/courses/:id/exercises`
- **Method**  
   `POST`
- **URL Params**
  - **Required:**  
     `id=[long]`
  - **Example:**  
    `/api/courses/1/exercises`
- **Data Params**
  - **Required:**  
    `"name": [string]` - Between 10 and 100 characters
  - **Example:**
  ```json
  {
    "name": "Spring Boot Exercise 1"
  }
  ```
- **Success Response**
  - **Code:** 201
  - **Content:**
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
- **Error Response**
  - **Code:** 400
  - **Content:**
  ```json
  {
    "errors": [
      {
        "fieldName": "name",
        "message": "Name cannot be empty"
      },
      {
        "fieldName": "name",
        "message": "Exercise name should be between 10 and 100 characters"
      }
    ]
  }
  ```
  OR
  - **Code:** 404
  - **Content:**
  ```text
      Not found: Course not found.
  ```

## Edit a course

---

Edit course fields. Currently you can edit with this method: name.

- **Required role:**  
   Teacher
- **URL**  
   `/api/courses/:courseId/exercises/:exerciseId`
- **Method**  
   `POST`
- **URL Params**
  - **Required:**  
     `courseId=[long]`  
     `exerciseId=[long]`
  - **Example:**  
    `/api/courses/1/exercises`
- **Data Params**
  - **Required:**  
    `"name": [string]` - Between 10 and 100 characters
  - **Example:**
  ```json
  {
    "name": "Spring Boot Course v2"
  }
  ```
- **Success Response**
  - **Code:** 201
  - **Content:**
  ```json
  {
    "id": 1,
    "name": "Spring Boot Course v2"
  }
  ```
- **Error Response**
  - **Code:** 400
  - **Content:**
  ```json
  {
    "errors": [
      {
        "fieldName": "name",
        "message": "Name cannot be empty"
      },
      {
        "fieldName": "name",
        "message": "Exercise name should be between 10 and 100 characters"
      }
    ]
  }
  ```
  OR
  - **Code:** 404
  - **Content:**
  ```text
      Not found: Course not found.
  ```
