// Bearer token helper for MockMvc security tests.
package com.trustus.bank.support;

import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.security.JwtTokenProvider;

public final class TestAuthHelper {

    private TestAuthHelper() {
    }

    public static String bearer(JwtTokenProvider jwtTokenProvider, String email, RoleType role) {
        return "Bearer " + jwtTokenProvider.generateToken(email, role.name());
    }
}
