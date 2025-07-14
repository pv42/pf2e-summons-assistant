function extractDCValueRegex(htmlContent) {
    // Look for button with data-action="spell-save" and extract data-dc value
    const regex = /<button[^>]*data-action="spell-save"[^>]*data-dc="(\d+)"[^>]*>/;
    const match = htmlContent.match(regex);

    return match ? parseInt(match[1], 10) : null;
}


