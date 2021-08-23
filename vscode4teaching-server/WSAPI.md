# WebSocket API Documentation

Document explaining how the WebSocket API for the server is used.  
This WebSocket server uses JWT for authentication, refer to [REST API Login](API.md#login) for more information.
The JWT has to be included as a `bearer` parameter in the URL, for example:  
`ws://localhost:8080/liveshare?bearer=jwttoken`  
All messages are expected to be formatted as JSON.

## Table of Contents

- [LiveShare](WSAPI.md#liveshare)
- [Dashboard refresh](WSAPI.md#dashboard-refresh)

## LiveShare

---

Sends a notification to the user in the `target` field with the LiveShare code in the `code` field.

- **URL**  
   `/liveshare`
- **Data Params**
  - **Required**:  
    `"code": [string]`  
    `"from": [string]`  
    `"target": [string]`
  - **Example**:

  ```json
  {
    "code": "livesharecode",
    "from": "student",
    "target": "teacher"
  }
  ```

- **Message sent to target**
  - **Content**:

  ```json
  {
    "handle": "liveshare",
    "from": "student",
    "code": "livesharecode"
  }
  ```

## Dashboard refresh

---

If a message is sent to this channel, sends a refresh signal to a specific teacher to indicate that there are dashboard updates available (see [Get all students' exercise info](API.md#get-all-students-exercise-info)).
Refresh signals are automatically sent to teachers when students update their exercises in any way.

- **URL**  
   `/dashboard-refresh`
- **Data Params**
  - **Required**:  
    `"teacher": [string]`
  - **Example**:

  ```json
  {
    "teacher": "johndoe"
  }
  ```

- **Message sent to target**
  - **Content**:

  ```json
  {
    "handle": "refresh"
  }
  ```
