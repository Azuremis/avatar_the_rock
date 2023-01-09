const generateAction = async (req, res) => {

    // Get input for the body of the request
    const input = JSON.parse(req.body).input;

    // Fetch request to Hugging Face
    const response = await fetch(
        'https://api-inference.huggingface.co/models/Azuremis/sd-1-5-stanito',
    {
        headers: {
                Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
                'Content-Type': 'application/json'
        },
            method: 'POST',
            body: JSON.stringify({
        inputs: input
    })
    }
);
    // Check for different statuses to send proper payload
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.status(200).json({ image: bufferToBase64(buffer) });
    } else if (response.status === 503) {
        const json = await response.json();
        res.status(503).json(json);
    } else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }

    console.log(response);
    if (response.ok) {
        let buffer = await response.arrayBuffer();
    }
};

const bufferToBase64 = (buffer) => {
    let arr = new Uint8Array(buffer);
    const base64 = btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/png;base64,${base64}`;
};

export default generateAction;