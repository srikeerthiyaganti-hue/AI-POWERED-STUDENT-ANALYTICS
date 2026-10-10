
# CORS Middleware configured for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        ```python
"https://ai-powered-student-analytics-g5yyvnry9-srikeerthiyaganti-hue.vercel.app",
```
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
