export const sendToken = (user, statusCode, message, res) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // Expires in 7 days
        httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        token,
        user,
    });
};
