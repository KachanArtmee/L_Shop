import { Request, Response } from "express";
import { LOCALE_COOKIE_CONF } from "../constants/general";
import { LocaleCode } from "../models/product.model";

const supportedLocales: LocaleCode[] = ["ru", "en"];

export class LocaleController {
    static getLocale(req: Request, res: Response) {
        const locale = req.cookies[LOCALE_COOKIE_CONF.name] as LocaleCode | undefined;
        const browserLanguage = String(req.headers["accept-language"] || "").toLowerCase();
        const suggestedLocale: LocaleCode = browserLanguage.includes("ru") || browserLanguage.includes("be")
            ? "ru"
            : "en";

        res.status(200).json({
            success: true,
            locale: supportedLocales.includes(locale as LocaleCode) ? locale : null,
            suggestedLocale,
        });
    }

    static setLocale(req: Request, res: Response) {
        const locale = req.body.locale as LocaleCode;

        if (!supportedLocales.includes(locale)) {
            res.status(400).json({ success: false, message: "Неподдерживаемый язык" });
            return;
        }

        res.cookie(LOCALE_COOKIE_CONF.name, locale, LOCALE_COOKIE_CONF);
        res.status(200).json({ success: true, locale });
    }

    static clearLocale(req: Request, res: Response) {
        res.clearCookie(LOCALE_COOKIE_CONF.name);
        res.status(200).json({ success: true });
    }
}
