# REST API Documentation

Document explaining how the REST API for the server is used.  
Note: All requests can respond with code 401 if the required role isn't fulfilled.
This REST server uses JWT for authentication, and CSRF Cookie for CSRF security.  
Every non GET request needs a header with the CSRF Token that comes with the cookie.  
Cookie key: `XSRF-TOKEN`  
Needed header key: `X-XSRF-TOKEN`

## Table of Contents

- [Login](API.md#login)
- [Get CSRF Token](API.md#get-csrf-token)
- [Register a new student](API.md#register-a-new-student)
- [Register a new teacher](API.md#register-a-new-teacher)
- [Get all users](API.md#get-all-users)
- [Get current user info](API.md#get-current-user-info)
- [Get all courses](API.md#get-all-courses)
- [Get course creator](API.md#get-course-creator)
- [Get users in course](API.md#get-users-in-course)
- [Get user courses](API.md#get-user-courses)
- [Add a course](API.md#add-a-course)
- [Edit a course](API.md#edit-a-course)
- [Delete a course](API.md#delete-a-course)
- [Add user to course](API.md#add-user-to-course)
- [Remove user from course](API.md#remove-user-from-course)
- [Get exercises of a course](API.md#get-exercises-of-a-course)
- [Add an exercise to a course](API.md#add-an-exercise-to-a-course)
- [Edit an exercise](API.md#edit-an-exercise)
- [Delete an exercise](API.md#delete-an-exercise)
- [Download exercise files](API.md#download-exercise-files)
- [Download exercise template](API.md#download-exercise-template)
- [Upload user files](API.md#upload-user-files)
- [Upload exercise template](API.md#upload-exercise-template)
- [Add comment thread](API.md#add-comment-thread)
- [Get comment threads](API.md#get-comment-threads)
- [Get comments by exercise and username](API.md#get-comments-by-exercise-and-username)
- [Get file info by exercise and owner](API.md#get-file-info-by-exercise-and-owner)

## Login

---

Log in on the server and receive the JWT Token. The token should be in an Authorization header like:
`Authorization: Bearer [token]`
where `token` is the token received in this request.

- **Required role**:  
   None
- **URL**  
   `/api/login`
- **Method**  
   `POST`
- **Data Params**
  - **Required**:  
    `"username": [string]`  
    `"password": [string]`
  - **Example**:

  ```json
  {
    "username": "johndoe",
    "password": "johnpassword"
  }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
    "jwtToken": "token"
  }
  ```

## Get CSRF Token

---

Empty method aimed to help getting the CSRF Cookie without getting any data. Note that you can get this CSRF Token from any request.

- **Required role**:  
   None
- **URL**  
   `/api/csrf`
- **Method**  
   `GET`
- **Success Response**
  - **Code**: 200
  - **Content**: Empty

## Register a new student

---

Register a new user as a student.

- **Required role**:  
   None
- **URL**  
   `/api/register`
- **Method**  
   `POST`
- **Data Params**
  - **Required**:  
    `"email": [string]` - valid email, unique  
    `"username": [string]` - Between 4 and 50 characters, unique  
    `"password": [string]` - Longer than 8 characters  
    `"name": [string]`  
    `"lastName": [string]`
  - **Example**:

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
  - **Code**: 201
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
  - **Code**: 400
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
  - **Code**: 400
  - **Content**

  ```text
  Duplicate entry 'johndoe'.
  ```

## Register a new teacher

---

Register a new user as a teacher.

- **Required role**:  
   Teacher
- **URL**  
   `/api/teachers/register`
- **Method**  
   `POST`
- **Data Params**
  - **Required**:  
    `"email": [string]` - valid email, unique  
    `"username": [string]` - Between 4 and 50 characters, unique  
    `"password": [string]` - Longer than 8 characters  
    `"name": [string]`  
    `"lastName": [string]`
  - **Example**:

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
  - **Code**: 201
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
  - **Code**: 400
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
  - **Code**: 400
  - **Content**

  ```text
  Duplicate entry 'johndoe'.
  ```

## Get all users

---

Get all available users.

- **Required role**:  
   Teacher
- **URL**  
   `/api/users`
- **Method**  
   `GET`
- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  [
      {
          "id": 3,
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
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 4,
          "username": "johndoejr",
          "name": "John",
          "lastName": "Doe Jr 1",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 5,
          "username": "johndoejr2",
          "name": "John",
          "lastName": "Doe Jr 2",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 6,
          "username": "johndoejr3",
          "name": "John",
          "lastName": "Doe Jr 3",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      }
  ]
  ```

## Get current user info

---

Get currently logged in user information and his courses.

- **Required role**:  
   Student/Teacher
- **URL**  
   `/api/currentuser`
- **Method**  
   `GET`
- **Success Response (Courses Found)**
  - **Code**: 200
  - **Content**:

  ```json
    {
      "id": 3,
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
      ],
      "courses": [
          {
              "id": 7,
              "name": "Spring Boot Course",
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          {
              "id": 8,
              "name": "Angular Course",
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          {
              "id": 9,
              "name": "VSCode Extension API Course",
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          }
      ],
      "createDateTime": "2019-11-14T11:46:11",
      "updateDateTime": "2019-11-14T11:46:11"
  }
  ```

## Get all courses

---

Get all available courses.

- **Required role**:  
   Student
- **URL**  
   `/api/courses`
- **Method**  
   `GET`
- **Success Response (Courses Found)**
  - **Code**: 200
  - **Content**:

  ```json
  [
      {
          "id": 7,
          "name": "Spring Boot Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:37:05",
              "updateDateTime": "2019-11-14T11:37:05"
          },
          "createDateTime": "2019-11-14T11:37:05",
          "updateDateTime": "2019-11-14T11:37:05"
      },
      {
          "id": 8,
          "name": "Angular Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:37:05",
              "updateDateTime": "2019-11-14T11:37:05"
          },
          "createDateTime": "2019-11-14T11:37:05",
          "updateDateTime": "2019-11-14T11:37:05"
      },
      {
          "id": 9,
          "name": "VSCode Extension API Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:37:05",
              "updateDateTime": "2019-11-14T11:37:05"
          },
          "createDateTime": "2019-11-14T11:37:05",
          "updateDateTime": "2019-11-14T11:37:05"
      }
  ]
  ```

- **Success Response (No courses found)**
  - **Code**: 204
  - **Content**: Empty

## Get course creator

---

Get the creator of a course.

- **Required role**:  
   None
- **URL**  
   `/api/courses/:courseId/creator`
   **Example**:
   `/api/courses/7/creator`
- **Method**  
   `GET`
- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
      "id": 3,
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
      ],
      "createDateTime": "2019-11-14T11:46:11",
      "updateDateTime": "2019-11-14T11:46:11"
  }
  ```

## Get users in course

---

Get all users in a course.

- **Required role**:  
   Student or Teacher
- **URL**  
   `/api/courses/:courseId/users`
- **URL Params**
  - **Required**
    - `courseId=[long]`
  - **Example**
    `/api/users/1/courses`
- **Method**  
   `GET`
- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  [
      {
          "id": 3,
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
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 4,
          "username": "johndoejr",
          "name": "John",
          "lastName": "Doe Jr 1",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 5,
          "username": "johndoejr2",
          "name": "John",
          "lastName": "Doe Jr 2",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      },
      {
          "id": 6,
          "username": "johndoejr3",
          "name": "John",
          "lastName": "Doe Jr 3",
          "roles": [
              {
                  "roleName": "ROLE_STUDENT"
              }
          ],
          "createDateTime": "2019-11-11T13:17:43",
          "updateDateTime": "2019-11-11T13:17:43"
      }
  ]
  ```

## Get user courses

---

Get courses available to the user. User indicated has to be the same as the user logged.

- **Required role**:  
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
  - **Code**: 200
  - **Content**:

  ```json
  [
      {
          "id": 7,
          "name": "Spring Boot Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 8,
          "name": "Angular Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 9,
          "name": "VSCode Extension API Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      }
  ]
  ```

- **Success Response (No courses found)**
  - **Code**: 204
  - **Content**: Empty

## Add a course

---

Add a course to the system. Saves the course in the name of the current logged in teacher.

- **Required role**:  
   Teacher
- **URL**  
   `/api/courses`
- **Method**  
   `POST`
- **Data Params**
  - **Required**:  
    `"name": [string]` - Between 10 and 100 characters
  - **Example**:

  ```json
  {
    "name": "Spring Boot Course"
  }
  ```

- **Success Response**
  - **Code**: 201
  - **Content**:

  ```json
  {
      "id": 343,
      "name": "New course",
      "creator": {
          "id": 3,
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
          ],
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      "createDateTime": "2019-11-14T11:47:58.929",
      "updateDateTime": "2019-11-14T11:47:58.929"
  }
  ```

- **Error Response**
  - **Code**: 400
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

## Edit a course

---

Edit course fields. Currently you can edit with this method: name.

- **Required role**:  
   Teacher
- **URL**  
   `/api/courses/:courseId`
- **Method**  
   `PUT`
- **URL Params**
  - **Required**:  
     `courseId=[long]`
  - **Example**:  
    `/api/courses/1`
- **Data Params**
  - **Required**:  
    `"name": [string]` - Between 10 and 100 characters
  - **Example**:

  ```json
  {
    "name": "Spring Boot Course v2"
  }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
      "id": 343,
      "name": "Edited course",
      "creator": {
          "id": 3,
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
          ],
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      "createDateTime": "2019-11-14T11:47:58",
      "updateDateTime": "2019-11-14T11:49:12.301"
  }
  ```

- **Error Response**
  - **Code**: 400
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
        "message": "Course name should be between 10 and 100 characters"
      }
    ]
  }
  ```

  OR
  - **Code**: 404
  - **Content**:

  ```text
      Not found: Course not found: 15.
  ```

## Delete a course

---

Remove a course. Logged user has to be the creator of this course.

- **Required role**:
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
  - **Code**: 204
- **Error Response**

  - **Code**: 404
  - **Content**:

  ```text
  Not found: Course not found: 15
  ```

## Add user to course

---

Add a user to a course.

- **Required role**:  
   Teacher
- **URL**  
   `/api/courses/:courseId/users`
- **Method**  
   `POST`
- **URL Params**
  - **Required**:  
     `courseId=[long]`
  - **Example**:  
    `/api/courses/1/users`
- **Data Params**
  - **Required**:  
    `"id": [[long]]` - User ids to add to course
  - **Example**:

  ```json
  {
    "ids": [4]
  }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
      "id": 341,
      "name": "new course",
      "usersInCourse": [
          {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-11T14:37:57",
              "updateDateTime": "2019-11-11T14:37:57"
          },
          {
              "id": 4,
              "username": "johndoejr",
              "name": "John",
              "lastName": "Doe Jr 1",
              "roles": [
                  {
                      "roleName": "ROLE_STUDENT"
                  }
              ],
              "createDateTime": "2019-11-11T14:37:57",
              "updateDateTime": "2019-11-11T14:37:57"
          }
      ],
      "createDateTime": "2019-11-11T14:40:06",
      "updateDateTime": "2019-11-11T14:40:06"
  }
  ```

  - **Code**: 404
  - **Content**:

  ```text
      Not found: Course not found: 15.
  ```

  OR

  - **Code**: 404
  - **Content**:

  ```text
      Not found: User not found: 3
  ```

  OR

  - **Code**: 401
  - **Content**:

  ```text
      User is not in course or teacher is not in this course.
  ```

## Remove user from course

---

Add a user to a course. Can't remove creator of this course.

- **Required role**:  
   Teacher
- **URL**  
   `/api/courses/:courseId/users`
- **Method**  
   `DELETE`
- **URL Params**
  - **Required**:  
     `courseId=[long]`
  - **Example**:  
    `/api/courses/1/users`
- **Data Params**
  - **Required**:  
    `"ids": [[long]]` - User ids to remove from course
  - **Example**:

  ```json
  {
    "ids": [4, 5]
  }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
      "id": 341,
      "name": "new course",
      "usersInCourse": [
          {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-11T14:37:57",
              "updateDateTime": "2019-11-11T14:37:57"
          }
      ],
      "createDateTime": "2019-11-11T14:40:06",
      "updateDateTime": "2019-11-11T14:40:06"
  }
  ```

  - **Code**: 404
  - **Content**:

  ```text
      Not found: Course not found: 15.
  ```

  OR

  - **Code**: 404
  - **Content**:

  ```text
      Not found: User not found: 3
  ```

  OR

  - **Code**: 401
  - **Content**:

  ```text
      User is not in course or teacher is not in this course.
  ```

## Get exercises of a course

---

Get all exercise of a course. Logged user has to be a member of this course.

- **Required role**:  
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
  - **Code**: 200
  - **Content**:

  ```json
    [
      {
          "id": 10,
          "name": "Exercise 1",
          "course": {
              "id": 7,
              "name": "Spring Boot Course",
              "creator": {
                  "id": 3,
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
                  ],
                  "createDateTime": "2019-11-14T11:46:11",
                  "updateDateTime": "2019-11-14T11:46:11"
              },
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 11,
          "name": "Exercise 2",
          "course": {
              "id": 7,
              "name": "Spring Boot Course",
              "creator": {
                  "id": 3,
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
                  ],
                  "createDateTime": "2019-11-14T11:46:11",
                  "updateDateTime": "2019-11-14T11:46:11"
              },
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 12,
          "name": "Exercise 3",
          "course": {
              "id": 7,
              "name": "Spring Boot Course",
              "creator": {
                  "id": 3,
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
                  ],
                  "createDateTime": "2019-11-14T11:46:11",
                  "updateDateTime": "2019-11-14T11:46:11"
              },
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 13,
          "name": "Exercise 4",
          "course": {
              "id": 7,
              "name": "Spring Boot Course",
              "creator": {
                  "id": 3,
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
                  ],
                  "createDateTime": "2019-11-14T11:46:11",
                  "updateDateTime": "2019-11-14T11:46:11"
              },
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      {
          "id": 14,
          "name": "Exercise 5",
          "course": {
              "id": 7,
              "name": "Spring Boot Course",
              "creator": {
                  "id": 3,
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
                  ],
                  "createDateTime": "2019-11-14T11:46:11",
                  "updateDateTime": "2019-11-14T11:46:11"
              },
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      }
  ]
  ```

- **Success Response (No courses found)**
  - **Code**: 204
  - **Content**: Empty
- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: Course not found: 15
  ```

## Add an exercise to a course

---

Adds a new exercise to an existing course.

- **Required role**:  
   Teacher
- **URL**  
   `/api/courses/:id/exercises`
- **Method**  
   `POST`
- **URL Params**
  - **Required**:
    - `id=[long]`
  - **Example**:  
    `/api/courses/1/exercises`
- **Data Params**
  - **Required**:  
    `"name": [string]` - Between 10 and 100 characters
  - **Example**:

  ```json
  {
    "name": "Spring Boot Exercise 1"
  }
  ```

- **Success Response**
  - **Code**: 201
  - **Content**:

  ```json
  {
      "id": 344,
      "name": "New exercise",
      "course": {
          "id": 7,
          "name": "Spring Boot Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      "createDateTime": "2019-11-14T11:55:15.553",
      "updateDateTime": "2019-11-14T11:55:15.553"
  }
  ```

- **Error Response**
  - **Code**: 400
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

  - **Code**: 404
  - **Content**:

  ```text
      Not found: Course not found.
  ```

## Edit an exercise

---

Edits an exercise fields.

- **Required role**:  
   Teacher
- **URL**  
   `/api/exercises/:exerciseId`
- **Method**  
   `PUT`
- **URL Params**
  - **Required**:  
     `exerciseId=[long]`
  - **Example**:  
    `/api/exercises/344`
- **Data Params**
  - **Required**:  
    `"name": [string]` - Between 10 and 100 characters
  - **Example**:

  ```json
  {
    "name": "Edited exercise"
  }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
  {
      "id": 344,
      "name": "Edited exercise",
      "course": {
          "id": 7,
          "name": "Spring Boot Course",
          "creator": {
              "id": 3,
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
              ],
              "createDateTime": "2019-11-14T11:46:11",
              "updateDateTime": "2019-11-14T11:46:11"
          },
          "createDateTime": "2019-11-14T11:46:11",
          "updateDateTime": "2019-11-14T11:46:11"
      },
      "createDateTime": "2019-11-14T11:55:15",
      "updateDateTime": "2019-11-14T11:56:41.523"
  }
  ```

- **Error Response**
  - **Code**: 400
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
  - **Code**: 404
  - **Content**:

  ```text
      Not found: Course not found: 15.
  ```

## Delete an exercise

---

Remove a course. Logged user has to be a teacher of this course.

- **Required role**:
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
  - **Code**: 204
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

- **Required role**:
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
  - **Code**: 200
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

## Download exercise template

---

Note: Content-Type is application/zip
Download the files assigned to an exercise template in a zip file.
Name of the file if template was downloaded: `template-{id}.zip` where {id} is the id of the exercise.

- **Required role**:
  Student or Teacher
- **URL**
  `/api/exercises/:id/files/template`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/11/files/template`
- **Success Response**
  - **Code**: 200
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

- **Required role**:
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
  - **Code**: 200
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

## Upload exercise template

Upload a ZIP file to the template of an exercise.
Body has to be multipart/form-data with key = `file` and value = the file.
Files with the same name will be overriden.

---

- **Required role**:
  Teacher
- **URL**
  `/api/exercises/:id/files/template`
- **Method**
  `POST`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/11/files/template`
- **Success Response**
  - **Code**: 200
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

## Get all students' files

---

Note: Content-Type is application/zip
Download the files assigned to an exercise for all students in a zip file.
Name of the file if template was downloaded: `exercise-{id}-files.zip` where {id} is the id of the exercise.

- **Required role**:
  Student or Teacher
- **URL**
  `/api/exercises/:id/teachers/files`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `id=[long]`
  - **Example**
    - `/api/exercises/11/files/template`
- **Success Response**
  - **Code**: 200
- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: Exercise not found: 11
  ```

## Add comment thread

Adds or overwrites a comment thread to a file.

---

- **Required role**:
  Student or Teacher
- **URL**
  `/api/files/:fileid/comments`
- **Method**
  `POST`
- **URL Params**
  - **Required**
    - `fileid=[long]`
  - **Example**
    - `/api/files/322/comments`
- **Data Params**
  - **Required**:  
    `"line": [long]` - Line of the file that contains a comment thread  
    `"comments": [Comment]` - Comments of the thread, which need to have the following required params:
        `"author": [string]` - Author of the comment
        `"body": [string]` - Content of the comment
  - **Example**:

  ```json
    {
        "line": 0,
        "comments": [
            {
                "author": "johndoe",
                "body": "Test 1"
            },
            {
                "author": "johndoe",
                "body": "Test 2"
            }
        ]
    }
  ```

- **Success Response**
  - **Code**: 200
  - **Content**:

  ```json
    {
        "id": 345,
        "comments": [
            {
                "id": 346,
                "body": "Test 1",
                "author": "johndoe",
                "createDateTime": "2020-02-15T16:15:30",
                "updateDateTime": "2020-02-15T16:15:30"
            },
            {
                "id": 347,
                "body": "Test 2",
                "author": "johndoe",
                "createDateTime": "2020-02-15T16:15:30",
                "updateDateTime": "2020-02-15T16:15:30"
            }
        ],
        "line": 0,
        "createDateTime": "2020-02-15T16:15:30",
        "updateDateTime": "2020-02-15T16:15:30"
    }
  ```

- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: 322
  ```

## Get comment threads

---

Get the posted comment threads of a file.

- **Required role**:
  Student or Teacher
- **URL**
  `/api/files/:fileid/comments`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `fileid=[long]`
  - **Example**
    - `/api/files/322/comments`
- **Success Response**
  - **Code**: 200
  - **Content**:

    ```json
    [
        {
            "id": 345,
            "comments": [
                {
                    "id": 346,
                    "body": "Test 1",
                    "author": "johndoe",
                    "createDateTime": "2020-02-15T16:15:30",
                    "updateDateTime": "2020-02-15T16:15:30"
                },
                {
                    "id": 347,
                    "body": "Test 2",
                    "author": "johndoe",
                    "createDateTime": "2020-02-15T16:15:30",
                    "updateDateTime": "2020-02-15T16:15:30"
                }
            ],
            "line": 0,
            "createDateTime": "2020-02-15T16:15:30",
            "updateDateTime": "2020-02-15T16:15:30"
        }
    ]
    ```

    OR

  - **Code**: 204

- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: 322
  ```

## Get comments by exercise and username

---

Get the posted comment threads of the files owned by the given username in the given exercise.

- **Required role**:
  Student or Teacher
- **URL**
  `/api/users/:username/exercises/:exerciseId/comments`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `username=[string]`
    - `exerciseId=[long]`
  - **Example**
    - `/api/users/johndoejr3/exercises/10/comments`
- **Success Response**
  - **Code**: 200
  - **Content**:

    ```json
    [
        {
            "id": 333,
            "path": "ej.html",
            "comments": [
                {
                    "id": 346,
                    "comments": [
                        {
                            "id": 347,
                            "body": "test",
                            "author": "johndoe",
                            "createDateTime": "2020-02-18T13:25:46",
                            "updateDateTime": "2020-02-18T13:25:46"
                        },
                        {
                            "id": 348,
                            "body": "test 2",
                            "author": "johndoe",
                            "createDateTime": "2020-02-18T13:25:46",
                            "updateDateTime": "2020-02-18T13:25:46"
                        },
                        {
                            "id": 349,
                            "body": "test 3",
                            "author": "johndoe",
                            "createDateTime": "2020-02-18T13:25:46",
                            "updateDateTime": "2020-02-18T13:25:46"
                        }
                    ],
                    "line": 0,
                    "createDateTime": "2020-02-18T13:25:46",
                    "updateDateTime": "2020-02-18T13:25:46"
                }
            ],
            "createDateTime": "2020-02-18T13:25:43",
            "updateDateTime": "2020-02-18T13:25:43"
        }
    ]
    ```

    OR

  - **Code**: 204

- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: 322
  ```

## Get file info by exercise and owner

---

Get information of all of the files owned by a user in an exercise.

- **Required role**:
  Student or Teacher
- **URL**
  `/api/users/:userid/exercises/:exid/files`
- **Method**
  `GET`
- **URL Params**
  - **Required**
    - `userid=[long]`
    - `exid=[long]`
  - **Example**
    - `/api/users/4/exercises/3/files`
- **Success Response**
  - **Code**: 200
  - **Content**:

    ```json
    [
        {
            "id": 32,
            "path": "images\\imagePlaceholder.png",
            "createDateTime": "2020-02-16T12:39:48",
            "updateDateTime": "2020-02-16T12:39:48"
        },
        {
            "id": 35,
            "path": "pom.xml",
            "createDateTime": "2020-02-16T12:39:48",
            "updateDateTime": "2020-02-16T12:39:48"
        }
    ]
    ```

    OR

  - **Code**: 204

- **Error Response**
  - **Code**: 404
  - **Content**:

  ```text
  Not found: 322
  ```
