package co.za.funeralcover.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.Year;

/** Validates the Luhn checksum on a 13-digit SA ID number and extracts date of birth. */
public final class SaIdValidator {

    private SaIdValidator() {
    }

    public static boolean isValidChecksum(String id) {
        if (id == null || !id.matches("\\d{13}")) {
            return false;
        }
        int[] digits = id.chars().map(c -> c - '0').toArray();

        int oddSum = 0;
        for (int i = 0; i < 12; i += 2) {
            oddSum += digits[i];
        }

        StringBuilder evenConcat = new StringBuilder();
        for (int i = 1; i < 12; i += 2) {
            evenConcat.append(digits[i]);
        }
        long doubledEven = Long.parseLong(evenConcat.toString()) * 2;
        int evenSum = String.valueOf(doubledEven).chars().map(c -> c - '0').sum();

        int checkDigit = (10 - (oddSum + evenSum) % 10) % 10;
        return checkDigit == digits[12];
    }

    /** Returns null if the embedded YYMMDD isn't a real calendar date. */
    public static LocalDate extractDateOfBirth(String id) {
        if (id == null || !id.matches("\\d{13}")) {
            return null;
        }
        int yy = Integer.parseInt(id.substring(0, 2));
        int month = Integer.parseInt(id.substring(2, 4));
        int day = Integer.parseInt(id.substring(4, 6));

        int currentYy = Year.now().getValue() % 100;
        int century = yy <= currentYy ? 2000 : 1900;

        try {
            return LocalDate.of(century + yy, month, day);
        } catch (DateTimeException e) {
            return null;
        }
    }

    public static boolean isValid(String id) {
        return isValidChecksum(id) && extractDateOfBirth(id) != null;
    }
}
