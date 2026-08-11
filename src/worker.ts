type Environment = {
    ASSETS: {
        fetch(request: Request): Promise<Response>;
    };
    EBAY_VERIFICATION_TOKEN?: string;
};

const EBAY_ENDPOINT_PATH = "/api/ebay/account-deletion";

const jsonResponse = (
    body: Record<string, string>,
    status = 200,
): Response => {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const getEndpointUrl = (request: Request): string => {
    const url = new URL(request.url);

    // Remove eBay's challenge_code query parameter before hashing.
    url.search = "";
    url.hash = "";

    return url.toString();
};

const toLowercaseHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

const handleEbayGet = async (
    request: Request,
    env: Environment,
): Promise<Response> => {
    const requestUrl = new URL(request.url);
    const challengeCode = requestUrl.searchParams.get("challenge_code");
    const verificationToken = env.EBAY_VERIFICATION_TOKEN;

    if (!challengeCode) {
        return jsonResponse(
            {
                error: "Missing challenge_code query parameter.",
            },
            400,
        );
    }

    if (!verificationToken) {
        return jsonResponse(
            {
                error: "EBAY_VERIFICATION_TOKEN is not configured.",
            },
            500,
        );
    }

    const endpointUrl = getEndpointUrl(request);

    const valueToHash =
        challengeCode + verificationToken + endpointUrl;

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(valueToHash),
    );

    return jsonResponse({
        challengeResponse: toLowercaseHex(hashBuffer),
    });
};

const handleEbayPost = (): Response => {
    // Deal-Bot does not currently store eBay member data.
    // Future user-data features would require deletion handling here.
    return new Response(null, {
        status: 204,
    });
};

export default {
    async fetch(
        request: Request,
        env: Environment,
    ): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname !== EBAY_ENDPOINT_PATH) {
            return env.ASSETS.fetch(request);
        }

        if (request.method === "GET") {
            return handleEbayGet(request, env);
        }

        if (request.method === "POST") {
            return handleEbayPost();
        }

        return new Response("Method Not Allowed", {
            status: 405,
            headers: {
                Allow: "GET, POST",
            },
        });
    },
};