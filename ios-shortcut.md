# RunIQ iOS Shortcut Setup Guide

This guide outlines exactly how to construct the "RunIQ Evaluator" iOS Shortcut. You can build this once on your device and generate an iCloud link to distribute to your SaaS users.

## How it works
By using iOS's native "Back Tap" accessibility feature, drivers can simply double-tap the back of their phone when an offer appears. This triggers the shortcut instantly. The shortcut captures the screen, sends it to the Vercel backend, and returns a Spoken or Banner evaluation within 2 seconds.

## Building the Shortcut (Step-by-Step)

Open the **Shortcuts** app on your iPhone and create a new Shortcut named "RunIQ Evaluator".

### Step 1: Capture the Screen
1. Add the action: **Take Screenshot**
2. (Optional but recommended for speed) Add the action: **Resize Image**. 
   - Set it to resize to **Width 800**. This drastically reduces the upload payload size (from ~4MB to ~200KB) and makes Claude Vision process it much faster, without losing OCR accuracy.

### Step 2: Convert to Base64
1. Add the action: **Base64 Encode**
2. Set the input to the Resized Image.
3. Make sure "Line Breaks" is set to **None**.

### Step 3: Send to Vercel Backend
1. Add the action: **Get Contents of URL**
2. URL: `https://[YOUR_VERCEL_DOMAIN]/api/ios-ingest`
3. Tap "Show More" on the action:
   - Method: **POST**
   - Headers: Add `Content-Type: application/json`
   - Request Body: **JSON**
   - Add new field: `image_base64` -> Select the "Base64 Encoded" magic variable.
   - Add new field (Optional): `user_id` -> Enter the driver's unique ID.
   - Add new field (Optional): `feedback_preference` -> Enter `speak` or `banner`.

### Step 4: Parse the Response
The backend returns a JSON payload: `{"feedback_action": "speak", "spoken_text": "...", "banner_title": "...", "banner_body": "..."}`
1. Add the action: **Get Dictionary from Input** (Input is the Contents of URL)

### Step 5: Conditional Logic (Speak vs Banner)
1. Add an **If** action.
2. Condition: `Dictionary Value` for key `feedback_action` **is** `speak`.
   - **Inside the If block:**
     - Add the action: **Get Dictionary Value** for key `spoken_text`.
     - Add the action: **Speak Text** (Input is the Dictionary Value).
   - **Inside the Otherwise block:**
     - Add the action: **Get Dictionary Value** for key `banner_title`.
     - Add the action: **Get Dictionary Value** for key `banner_body`.
     - Add the action: **Show Notification** (Set Title to the first value, Body to the second).

## Activating "Back Tap"
To make this truly "First Come First Serve":
1. Open iPhone **Settings** > **Accessibility** > **Touch**.
2. Scroll to the bottom and select **Back Tap**.
3. Select **Double Tap**.
4. Scroll down to the Shortcuts section and select **RunIQ Evaluator**.

Now, anytime a Spark offer pops up on screen, simply double-tap the back of the phone. The phone will instantly screenshot, upload, evaluate, and speak the results aloud without ever leaving the Spark app!
