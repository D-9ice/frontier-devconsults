# WhatsApp owner alerts

Frontier DevConsults uses the official Meta WhatsApp Cloud API. WhatsApp is a second delivery channel attached to the durable monitoring event queue; an unavailable WhatsApp channel never blocks an enquiry or its email alert.

## Meta configuration

1. In Meta for Developers, create or select a business app and add WhatsApp.
2. Connect the WhatsApp Business Account and register the sender phone number.
3. Create a permanent system-user access token with `whatsapp_business_messaging` permission.
4. Create and obtain approval for a utility template with four body variables in this order:

   ```text
   Frontier alert: {{1}}
   {{2}}
   Time: {{3}}
   Review: {{4}}
   ```

5. Set the following server-only production environment variables. Never prefix them with `NEXT_PUBLIC_`:

   - `WHATSAPP_GRAPH_API_VERSION`: the supported Graph API version, for example the exact version selected in Meta.
   - `WHATSAPP_PHONE_NUMBER_ID`: Meta's numeric sender phone-number ID.
   - `WHATSAPP_ACCESS_TOKEN`: the permanent system-user token.
   - `WHATSAPP_OWNER_PHONE_E164`: the owner's destination number in E.164 digits, without `+` or spaces.
   - `WHATSAPP_ALERT_TEMPLATE_NAME`: the approved template name.
   - `WHATSAPP_ALERT_TEMPLATE_LANGUAGE`: the approved template language, such as `en_US`.
   - `WHATSAPP_APP_SECRET`: the Meta app secret used to verify webhook signatures.
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: a separate random value of at least 32 characters.

6. Configure the Meta webhook callback as `https://frontier-devconsults.com/api/webhooks/whatsapp`, enter the same webhook verification token, and subscribe the WhatsApp Business Account to `messages`.

## Release and verification

1. Apply `supabase/migrations/202609120021_whatsapp_owner_alerts.sql` to production.
2. Deploy the application after the migration and environment variables are present.
3. From **Admin → Monitoring & owner alerts**, send one labelled delivery test.
4. Confirm that the WhatsApp status advances from `accepted` to `sent`, `delivered`, or `read`. API acceptance alone is not delivery confirmation.
5. Temporarily use an invalid test-only token in a non-production environment to verify retry behavior, then restore the correct token and confirm the same event is delivered once. The unique event/channel record prevents duplicates.

Do not place access tokens, app secrets, or webhook verification tokens in source control or browser-visible configuration.
