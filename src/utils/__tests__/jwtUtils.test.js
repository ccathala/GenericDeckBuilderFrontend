/**
 * Tests pour les utilitaires JWT
 */

const {
  decodeJwt,
  isTokenExpired,
  getTimeUntilExpiration,
  isTokenExpiringSoon,
  getEmailFromToken,
} = require("../jwtUtils");

// Mock d'un token JWT valide (payload: {"sub":"test@example.com","iat":1640995200,"exp":2000000000})
const VALID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjIwMDAwMDAwMDB9.4f1g7GAaKkqhkiPuPMd8POKqgWPz8rBf8DGUTbm0r1Y";

// Mock d'un token JWT expiré (payload: {"sub":"test@example.com","iat":1640995200,"exp":1640995300})
const EXPIRED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUzMDB9.k8i6G4PVdToFXLRu2CcR8QvkHfkP2R4vBQvWxCfyxfU";

const INVALID_TOKEN = "invalid.token.format";

describe("JWT Utils", () => {
  describe("decodeJwt", () => {
    test("doit décoder un token JWT valide", () => {
      const decoded = decodeJwt(VALID_TOKEN);

      expect(decoded).toBeTruthy();
      expect(decoded.sub).toBe("test@example.com");
      expect(decoded.exp).toBe(2000000000);
    });

    test("doit retourner null pour un token invalide", () => {
      const decoded = decodeJwt(INVALID_TOKEN);
      expect(decoded).toBeNull();
    });

    test("doit retourner null pour un token null", () => {
      const decoded = decodeJwt(null);
      expect(decoded).toBeNull();
    });

    test("doit retourner null pour un token vide", () => {
      const decoded = decodeJwt("");
      expect(decoded).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    test("doit retourner false pour un token valide non expiré", () => {
      const expired = isTokenExpired(VALID_TOKEN);
      expect(expired).toBe(false);
    });

    test("doit retourner true pour un token expiré", () => {
      const expired = isTokenExpired(EXPIRED_TOKEN);
      expect(expired).toBe(true);
    });

    test("doit retourner true pour un token invalide", () => {
      const expired = isTokenExpired(INVALID_TOKEN);
      expect(expired).toBe(true);
    });

    test("doit retourner true pour un token null", () => {
      const expired = isTokenExpired(null);
      expect(expired).toBe(true);
    });
  });

  describe("getTimeUntilExpiration", () => {
    test("doit retourner le temps restant pour un token valide", () => {
      const timeLeft = getTimeUntilExpiration(VALID_TOKEN);

      // Le token expire en 2033, donc le temps restant doit être positif
      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(
        2000000000 - Math.floor(Date.now() / 1000)
      );
    });

    test("doit retourner 0 pour un token expiré", () => {
      const timeLeft = getTimeUntilExpiration(EXPIRED_TOKEN);
      expect(timeLeft).toBe(0);
    });

    test("doit retourner 0 pour un token invalide", () => {
      const timeLeft = getTimeUntilExpiration(INVALID_TOKEN);
      expect(timeLeft).toBe(0);
    });

    test("doit retourner 0 pour un token null", () => {
      const timeLeft = getTimeUntilExpiration(null);
      expect(timeLeft).toBe(0);
    });
  });

  describe("isTokenExpiringSoon", () => {
    test("doit retourner false pour un token avec beaucoup de temps restant", () => {
      const expiringSoon = isTokenExpiringSoon(VALID_TOKEN, 5);
      expect(expiringSoon).toBe(false);
    });

    test("doit retourner false pour un token expiré", () => {
      const expiringSoon = isTokenExpiringSoon(EXPIRED_TOKEN, 5);
      expect(expiringSoon).toBe(false);
    });

    test("doit retourner false pour un token invalide", () => {
      const expiringSoon = isTokenExpiringSoon(INVALID_TOKEN, 5);
      expect(expiringSoon).toBe(false);
    });

    // Test avec un token qui expire bientôt
    test("doit retourner true pour un token qui expire dans quelques minutes", () => {
      // Créer un token qui expire dans 3 minutes (180 secondes)
      const futureExp = Math.floor(Date.now() / 1000) + 180;
      const soonExpiringPayload = btoa(
        JSON.stringify({
          sub: "test@example.com",
          exp: futureExp,
        })
      );
      const soonExpiringToken = `header.${soonExpiringPayload}.signature`;

      const expiringSoon = isTokenExpiringSoon(soonExpiringToken, 5);
      expect(expiringSoon).toBe(true);
    });
  });

  describe("getEmailFromToken", () => {
    test("doit extraire l'email d'un token valide", () => {
      const email = getEmailFromToken(VALID_TOKEN);
      expect(email).toBe("test@example.com");
    });

    test("doit retourner null pour un token invalide", () => {
      const email = getEmailFromToken(INVALID_TOKEN);
      expect(email).toBeNull();
    });

    test("doit retourner null pour un token null", () => {
      const email = getEmailFromToken(null);
      expect(email).toBeNull();
    });

    test("doit retourner null pour un token sans subject", () => {
      const noSubPayload = btoa(
        JSON.stringify({
          iat: 1640995200,
          exp: 2000000000,
        })
      );
      const noSubToken = `header.${noSubPayload}.signature`;

      const email = getEmailFromToken(noSubToken);
      expect(email).toBeNull();
    });
  });

  describe("Gestion des erreurs", () => {
    test("doit gérer gracieusement les tokens malformés", () => {
      const malformedTokens = [
        "just.one.part",
        "too.many.parts.here.really",
        "header.invalid-base64.signature",
        "header..signature",
      ];

      malformedTokens.forEach((token) => {
        expect(decodeJwt(token)).toBeNull();
        expect(isTokenExpired(token)).toBe(true);
        expect(getTimeUntilExpiration(token)).toBe(0);
        expect(isTokenExpiringSoon(token)).toBe(false);
        expect(getEmailFromToken(token)).toBeNull();
      });
    });

    test("doit gérer les tokens avec du JSON invalide", () => {
      // Encoder du JSON invalide en base64
      const invalidJsonPayload = btoa('{"invalid": json}');
      const invalidJsonToken = `header.${invalidJsonPayload}.signature`;

      expect(decodeJwt(invalidJsonToken)).toBeNull();
      expect(isTokenExpired(invalidJsonToken)).toBe(true);
      expect(getTimeUntilExpiration(invalidJsonToken)).toBe(0);
      expect(getEmailFromToken(invalidJsonToken)).toBeNull();
    });
  });
});
