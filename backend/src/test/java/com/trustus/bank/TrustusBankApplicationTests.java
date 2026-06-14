/**
 * @summary Smoke test that the Spring context loads. 
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TrustusBankApplicationTests {

    @Test
    void contextLoads() {
    }
}
