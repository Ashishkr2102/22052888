const express = require("express");
const axios = require("axios");

const app = express();
const SERVER_PORT =5000;
const BASE_URL ="http://20.244.56.144/evaluation-service";

const apiClient =axios.create({
    baseURL:BASE_URL,
    headers:{
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA1NTU4LCJpYXQiOjE3NDM2MDUyNTgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImNiNDQzZTllLThhMjMtNGJjYS05ZTk1LWI1NDc2MDBmZTNhNCIsInN1YiI6IjIyMDUyODg4QGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1Mjg4OEBraWl0LmFjLmluIiwibmFtZSI6ImFzaGlzaCBrdW1hciIsInJvbGxObyI6IjIyMDUyODg4IiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiY2I0NDNlOWUtOGEyMy00YmNhLTllOTUtYjU0NzYwMGZlM2E0IiwiY2xpZW50U2VjcmV0IjoiekNhYURxaEJZa3ZnelViayJ9.bEWSFkZ1hDbrwtgCp6EvDHf_2Swe1pymmjjNMemIoIw`
    },
    timeout:10000,
});
const dataCache = {
    users: null,
    posts: {},
    comments: {},
};
const getUsers =async()=>{
    if (dataCache.users) 
        return dataCache.users;
    const response=await apiClient.get("/users");
    dataCache.users=response.data.users;
    return dataCache.users;
};
const getUserPosts=async (userId) => {
    if (dataCache.posts[userId]) return dataCache.posts[userId];
    const response = await apiClient.get(`/users/${userId}/posts`);
    dataCache.posts[userId] = response.data.posts;
    return dataCache.posts[userId];
};
const getPostComments=async (postId) => {
    if (dataCache.comments[postId]) return dataCache.comments[postId];
    const response = await apiClient.get(`/posts/${postId}/comments`);
    dataCache.comments[postId] = response.data.comments.length;
    return dataCache.comments[postId];
};
app.get("/users",async(req,res) => 
    {
    try {
        const users =await getUsers();
        const userPostCounts ={};

        await Promise.all(
            Object.keys(users).map(async (userId) => {
                const posts = await getUserPosts(userId);
                userPostCounts[userId] = posts.length;
            })
        );
        const topUsers = Object.entries(userPostCounts)
            .sort(([, countA],[,countB]) => countB - countA)
            .slice(0, 5)
            .map(([userId]) => ({
                id: userId,
                name: users[userId],
                postCount: userPostCounts[userId],
            }));
        res.json(topUsers);
    } catch (error) {
        console.error("Error fetching top users:", error);
        res.status(500).json({ error: "Failed to fetch top users" });
    }
});

app.get("/posts",async(req,res) => {
    try {
        const { type } =req.query;
        if (!["latest","popular"].includes(type)) {
            return res.status(400).json({ error: "Invalid type parameter. Use 'latest' or 'popular'." });
        }
        const users=await getUsers();
        let postsList =[];

        await Promise.all(
            Object.keys(users).map(async (userId) => {
                const posts =await getUserPosts(userId);
                postsList =postsList.concat(posts);
            })
        );
        if (type ==="latest") {
            return res.json(postsList.sort((a, b) => b.id - a.id).slice(0, 5));
        }
        await Promise.all(
            postsList.map(async (post) => {
                if (!dataCache.comments[post.id]) {
                    dataCache.comments[post.id] = await getPostComments(post.id);
                }
            })
        );
        const highestCommentCount=Math.max(...Object.values(dataCache.comments));
        const trendingPosts=postsList.filter(post => dataCache.comments[post.id] === highestCommentCount);

        return res.json(trendingPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});
app.listen(SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_PORT}`);
});
