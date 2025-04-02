# 22052888
# Social Media Analytics Backend

## Overview
This is an Express.js-based backend service that provides APIs for retrieving social media analytics, including top users with the highest number of posts and trending posts with the most comments.

## Features
- Fetches and caches user data for efficient retrieval.
- Retrieves the top five users based on post count.
- Fetches the latest posts and identifies trending posts based on comment count.
- Utilizes Axios to communicate with an external evaluation service.

## API Endpoints
### 1. Get Top Users
```
GET /users
```
**Response:**
```json
[
  {
    "id": "123",
    "name": "John Doe",
    "postCount": 10
  }
]
```

### 2. Get Posts
```
GET /posts?type=latest|popular
```
- `type=latest`: Fetches the latest 5 posts.
- `type=popular`: Fetches posts with the highest number of comments.

**Response:**
```json
[
  {
    "id": "post1",
    "content": "Example post content",
    "comments": 15
  }
]
```

## Installation & Setup
1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node index.js
   ```
4. The server will run at `http://localhost:5000`.

## Dependencies
- Express.js
- Axios

## Notes
- The application caches user, post, and comment data for efficiency.
- The backend communicates with an external API service for fetching user and post data.
- The API requires an Authorization token for requests.

## License
This project is for evaluation purposes only.

