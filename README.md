# PERCH Facebook poster

Every morning (07:00 Maldives time) a Vercel cron picks today's products, writes a caption with Claude,
renders a 1080x1350 branded image, and schedules the posts on your Facebook Page (10:00 to 20:00).
- At least 2 posts a day, and enough per day that every in-stock product is posted again within 7 days.
- New products (createdAt in the last 7 days) go first.
- The post design (layout + colours) changes every week automatically. Edit lib/config.ts to change the palettes.
- Scheduled posts show in Meta Business Suite under Planned, so you can review, edit or delete any before it goes out.

## Setup
1. Meta: create an app at developers.facebook.com, add your Page, and create a long-lived Page access token
   with pages_manage_posts and pages_read_engagement. Put the Page ID and token in the env vars below.
2. Products: set PRODUCTS_API_URL (see .env.example). After deploying, open /api/debug/products to check it reads your products correctly.
3. Vercel: import this folder as a NEW project, add every variable from .env.example, deploy.
4. Test the image: open https://YOUR-PROJECT.vercel.app/api/render?id=PRODUCT_ID
5. Test the posting: curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR-PROJECT.vercel.app/api/cron/post
