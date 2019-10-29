# REST API Documentation

Document explaining how the REST API for the server is used.  
Note: All requests can respond with code 401 if the required role isn't fulfilled.

## Table of Contents

- [Login](API.md#login)
- [Get current user info](API.md#get-current-user-info)
- [Register a new student](API.md#register-a-new-student)
- [Register a new teacher](API.md#register-a-new-teacher)
- [Get all courses](API.md#get-all-courses)
- [Add a course](API.md#add-a-course)
- [Add an exercise to a course](API.md#add-an-exercise-to-a-course)
- [Edit a course](API.md#edit-a-course)
- [Delete a course](API.md#delete-a-course)
- [Get exercises of a course](API.md#get-exercises-of-a-course)
- [Delete an exercise](API.md#delete-an-exercise)
- [Download exercise files](API.md#download-exercise-files)

## Login

---

Log in on the server and receive the JWT Token. The token should be in an Authorization header like:
`Authorization: Bearer [token]`
where `token` is the token received in this request.

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
  - **Content**:
  ```json
  {
    "jwtToken": "token"
  }
  ```

## Get current user info

---

Get information on current logged user (JWT Token information).

- **Required role:**  
   Student or Teacher
- **URL**  
   `/api/currentuser`
- **Method**  
   `GET`
- **Success Response**
  - **Code:** 200
  - **Content**:
  ```json
  {
    "id": 3,
    "email": "johndoe@teacher.com",
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
- **Error Response**
  - **Code:** 401

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
  - **Content**:
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
  - **Content**:
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
  - **Content**:
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

## Get user courses

---

Get courses available to the user. User indicated has to be the same as the user logged.

- **Required role:**  
   Student or Teacher
- **URL**  
   `/api/users/:id/courses`
- **Method**  
   `GET`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    `/api/users/1/courses`
- **Success Response (Courses Found)**
  - **Code:** 200
  - **Content**:
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
  - **Content**:
  ```json
  {
    "id": 1,
    "name": "Spring Boot Course"
  }
  ```
- **Error Response**
  - **Code:** 400
  - **Content**:
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
    - `id=[long]`
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
  - **Content**:
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
  - **Content**:
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
  - **Content**:
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
  - **Code:** 200
  - **Content**:
  ```json
  {
    "id": 1,
    "name": "Spring Boot Course v2"
  }
  ```
- **Error Response**
  - **Code:** 400
  - **Content**:
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
  - **Content**:
  ```text
      Not found: Course not found: 15.
  ```

## Delete a course

---

Remove a course. Logged user has to be a teacher of this course.

- **Required role:**
  Teacher
- **URL**
  `/api/courses/:id`
- **Method**
  `DELETE`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/courses/7`
- **Success Response**
  - **Code:** 204
- **Error Response**

  - **Code**: 404
  - **Content**:

  ```text
  Not found: Course not found: 15
  ```

## Get exercises of a course

---

Get all exercise of a course. Logged user has to be a member of this course.

- **Required role:**  
   Student, Teacher
- **URL**  
   `/api/courses/:id/exercises`
- **Method**  
   `GET`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/courses/7/exercises`
- **Success Response**
  - **Code:** 200
  - **Content**:
  ```json
  [
    {
      "id": 10,
      "name": "Exercise 1",
      "course": {
        "id": 7,
        "name": "Spring Boot Course"
      }
    },
    {
      "id": 11,
      "name": "Exercise 2",
      "course": {
        "id": 7,
        "name": "Spring Boot Course"
      }
    },
    {
      "id": 12,
      "name": "Exercise 3",
      "course": {
        "id": 7,
        "name": "Spring Boot Course"
      }
    }
  ]
  ```
- **Success Response (No courses found)**
  - **Code:** 204
  - **Content**: Empty
- **Error Response**
  - **Code**: 404
  - **Content**:
  ```text
  Not found: Course not found: 15
  ```

## Delete an exercise

---

Remove a course. Logged user has to be a teacher of this course.

- **Required role:**
  Teacher
- **URL**
  `/api/exercises/:id`
- **Method**
  `DELETE`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/7`
- **Success Response**
  - **Code:** 204
- **Error Response**
  - **Code**: 404
  - **Content**:
  ```text
  Not found: Exercise not found: 15
  ```

## Download exercise files

---

Note: Content-Type is application/zip
Download the files assigned to an exercise in a zip file.
The files downloaded will be the template of the exercise if the current logged user doesn't have saved files, and his/her files if he/she does.
Name of the file if template was downloaded: `template-{id}.zip` where {id} is the id of the exercise.
Name of the file if user files were downloaded: `exercise-{id}-{username}.zip` where {id} is the id of the exercise and {username} is the username of the logged user.

- **Required role:**
  Student or Teacher
- **URL**
  `/api/exercises/:id/files`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/11/files`
- **Success Response**
  - **Code:** 200
- **Error Response**
  - **Code**: 404
  - **Content**:
  ```text
  Not found: Exercise not found: 11
  ```
  OR
  - **Code**: 404
  - **Content** :
  ```text
  No template found for exercise: 11
  ```

## Upload user files

Upload a ZIP file to the user files of an exercise.
Body has to be multipart/form-data with key = `file` and value = the file.
Files with the same name will be overriden.

---

- **Required role:**
  Student or Teacher
- **URL**
  `/api/exercises/:id/files`
- **Method**
  `POST`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/11/files`
- **Success Response**
  - **Code:** 200
  - **Content**:
  ```json
  [
    {
      "fileName": "ex1.html",
      "fileType": "text/html",
      "size": 23
    },
    {
      "fileName": "ex2.html",
      "fileType": "text/html",
      "size": 23
    }
  ]
  ```
- **Error Response**
  - **Code**: 404
  - **Content**:
  ```text
  Not found: Exercise not found: 11
  ```
