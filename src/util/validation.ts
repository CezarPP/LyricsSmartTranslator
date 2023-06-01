export function isYoutubeLink(url: string): boolean {
    let pattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
    return pattern.test(url);
}

export function isEmailValid(email: string): boolean{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}