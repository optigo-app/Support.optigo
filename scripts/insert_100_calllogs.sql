-- ==============================================================================
-- Script: Insert 100 Professional Dummy Call Log Entries
-- Target Tables: [dbo].[CallLog] & [dbo].[CallLog_tracking]
-- Database: Central / Optigo DB context
-- Author: Auto-Generated for ERP Support Call Logging
-- Rules applied:
--   - CreatedBy: Fixed = 23
--   - Companies: Picked from 20 designated ProjectIDs from master list
--   - Characters: 100 fictional characters (Marvel, DC, Anime, Movies)
--   - Descr: Professional ERP domain issues (Payroll, Manufacturing, E-Invoice, RFID, AI, etc.)
--   - Sequential CallLogId & LogId auto-incremented safely from existing MAX
-- ==============================================================================

SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
    -- ==============================================================================
    -- STEP 1: TRUNCATE / DELETE OLD CALL LOG DATA (WITH COMMENTS)
    -- ==============================================================================
    -- Note on TRUNCATE vs DELETE in SQL Server:
    -- If tables have Foreign Key (FK) references, TRUNCATE will fail with error 4712.
    -- Therefore, we delete from child / dependent tables first, then the parent table.
    -- If your tables do NOT have active FK constraints, you can also use TRUNCATE TABLE.
    
    PRINT 'Cleaning up old Call Log transaction data...';

    -- 1.1 Clear Child / Related comments and attachments
    IF OBJECT_ID('[dbo].[CallLog_Comments]', 'U') IS NOT NULL
    BEGIN
        DELETE FROM [dbo].[CallLog_Comments];
        -- Optional: TRUNCATE TABLE [dbo].[CallLog_Comments];
    END

    -- 1.2 Clear Follow-up records if any exist
    IF OBJECT_ID('[dbo].[CallLog_Follow_Up]', 'U') IS NOT NULL
    BEGIN
        DELETE FROM [dbo].[CallLog_Follow_Up];
    END

    -- 1.3 Clear CallLog tracking / audit log table
    IF OBJECT_ID('[dbo].[CallLog_tracking]', 'U') IS NOT NULL
    BEGIN
        DELETE FROM [dbo].[CallLog_tracking];
        -- Optional: TRUNCATE TABLE [dbo].[CallLog_tracking];
    END

    -- 1.4 Clear Master CallLog table
    IF OBJECT_ID('[dbo].[CallLog]', 'U') IS NOT NULL
    BEGIN
        DELETE FROM [dbo].[CallLog];
        -- Optional: TRUNCATE TABLE [dbo].[CallLog];
    END

    -- 1.5 Optional: If CallLog has an IDENTITY column, reset it back to 0
    -- DBCC CHECKIDENT ('[dbo].[CallLog]', RESEED, 0);

    -- 1.6 Determine Starting Auto-Increment IDs (will be 0 after truncate/clean)
    DECLARE @StartCallLogId INT = ISNULL((SELECT MAX(CallLogId) FROM [dbo].[CallLog]), 0);
    DECLARE @StartLogId INT = ISNULL((SELECT MAX(LogId) FROM [dbo].[CallLog_tracking]), 0);

    -- 2. Staging Table with all 100 records
    CREATE TABLE #StagingCallLogs (
        RowId INT,
        EntryDate DATETIME,
        CustomerName NVARCHAR(255),
        ProjectID INT,
        ProjectCode NVARCHAR(100),
        AppId INT,
        Descr NVARCHAR(MAX),
        CallTypeId INT,
        CreatedBy INT
    );

    INSERT INTO #StagingCallLogs (RowId, EntryDate, CustomerName, ProjectID, ProjectCode, AppId, Descr, CallTypeId, CreatedBy)
    VALUES
        (1, '2026-10-01 09:00:00', 'Tony Stark', 25, 'Dee/Dee_Creation', 13, 'Biometric biometric attendance thumb punch sync failing for factory night shift operators', 4, 23),
        (2, '2026-10-02 10:07:13', 'Bruce Banner', 27, 'vidsy/Shah Pvt LMt', 13, 'Overtime (OT) rate calculation 1.5x formula discrepancy in monthly salary payslip generation', 5, 23),
        (3, '2026-10-03 11:14:26', 'Natasha Romanoff', 30, 'ThGems/skylark', 13, 'TDS section 192 tax deduction slab exemption 80C not deducting properly in payroll preview', 3, 23),
        (4, '2026-10-04 12:21:39', 'Peter Parker', 38, 'ABHISHEKS/M Diamond', 13, 'PF ECR electronic challan cum return text file export column format alignment issue', 11, 23),
        (5, '2026-10-05 13:28:52', 'Stephen Strange', 47, 'ArjunMahajan/Kolar Gold Field', 13, 'Short training on employee advance loan installment schedule configuration and EMI auto-debit', 1, 23),
        (6, '2026-10-06 14:35:05', 'Wanda Maximoff', 53, 'robert/Robert Downey Jr', 13, 'Staff training on monthly salary structure setup, allowances breakup, and professional tax slabs', 2, 23),
        (7, '2026-10-07 15:42:18', 'Thor Odinson', 66, 'goku/Jew Maufacturer', 13, 'Leave encashment balance calculation error for employees completing probation period', 4, 23),
        (8, '2026-10-08 16:49:31', 'Steve Rogers', 68, 'viraj/NZK PVT LMT', 13, 'Bonus calculation formula query for factory workers based on gross vs basic wage component', 5, 23),
        (9, '2026-10-09 17:56:44', 'Clint Barton', 88, 'deep1/vinayaka LTD', 13, 'Gratuity calculation report discrepancy for resigned employees with more than 5 years tenure', 3, 23),
        (10, '2026-10-10 09:03:57', 'Matt Murdock', 134, 'TEST DLF/DLF CUSTOMER', 25, 'Gold casting lot melting loss percentage calculation exceeding standard 1.2% allowable limit', 4, 23),
        (11, '2026-10-11 10:10:10', 'Sam Wilson', 171, 'optigocarely/orail25', 25, 'Job card BOM metal weight variance between wax tree gross weight and final casted product', 3, 23),
        (12, '2026-10-12 11:17:23', 'Bucky Barnes', 193, 'anjum/NAYKA JEWELS', 25, 'Karigar daily gold balance reconciliation ledger showing negative fine gold balance in department', 5, 23),
        (13, '2026-10-13 12:24:36', 'Carol Danvers', 205, 'ambikesh/Madhav Jewellers', 25, 'Short training for casting supervisor on tree planning, flask weight logging, and alloy calculation', 1, 23),
        (14, '2026-10-14 13:31:49', 'T''Challa', 213, 'John_Dev/John Dev', 25, 'Stone setting department diamond issue vs return breakage allowance validation error', 4, 23),
        (15, '2026-10-15 14:38:02', 'Loki Laufeyson', 225, 'mili/Shah Pvt LMt', 25, 'Job work stage transition from polishing to laser soldering throwing invalid status error', 5, 23),
        (16, '2026-10-16 15:45:15', 'James Rhodes', 306, 'Scott/Travis and Company', 25, 'Departmental metal issue voucher duplicate entry warning on barcode scan during batch dispatch', 3, 23),
        (17, '2026-10-17 16:52:28', 'Scott Lang', 343, 'AG/Avishkar gems', 25, 'End-to-end manufacturing process training: cad design, cam wax, casting, filing, setting to polish', 2, 23),
        (18, '2026-10-18 17:59:41', 'Nick Fury', 345, 'OM00000/OM JEWELLERS', 25, 'Updated alloy mix composition ratio for 18K Rose Gold casting master catalog', 11, 23),
        (19, '2026-10-19 09:06:54', 'Phil Coulson', 1444, 'VK18/One8', 25, 'Scrap recovery ledger physical gold dust weighing vs system recorded recovery mismatch', 4, 23),
        (20, '2026-10-20 10:13:07', 'Peggy Carter', 1505, 'VGD2004/Vinay Gold & Diamonds', 26, 'Outside job worker delivery challan Annexure IV GST e-way bill generation timeout', 4, 23),
        (21, '2026-10-21 11:20:20', 'Pepper Potts', 25, 'Dee/Dee_Creation', 26, 'Subcontractor hallmarking batch tracking status not updating upon receiving certification lot', 3, 23),
        (22, '2026-10-22 12:27:33', 'Peter Quill', 27, 'vidsy/Shah Pvt LMt', 26, 'Vendor metal ledger balance calculation inquiry after returning pure gold bar replenishment', 5, 23),
        (23, '2026-10-23 13:34:46', 'Gamora', 30, 'ThGems/skylark', 26, 'Outside karigar enamel work labor charges rate card not applying automatically to job card', 4, 23),
        (24, '2026-10-24 14:41:59', 'Shang-Chi', 38, 'ABHISHEKS/M Diamond', 26, 'Short demo on issuing raw casting lot with diamond packets to external micro-prong setter', 1, 23),
        (25, '2026-10-25 15:48:12', 'Reed Richards', 47, 'ArjunMahajan/Kolar Gold Field', 26, 'Subcontractor contact details and GSTIN validation update in master vendor registry', 11, 23),
        (26, '2026-10-26 16:55:25', 'Bruce Wayne', 53, 'robert/Robert Downey Jr', 26, 'Job worker delivery challan printing format missing customer laser hallmark serial number', 3, 23),
        (27, '2026-10-27 17:02:38', 'Clark Kent', 66, 'goku/Jew Maufacturer', 26, 'Discrepancy in outside karigar wastage deduction percentage on rhodium plating job work', 5, 23),
        (28, '2026-10-28 09:09:51', 'Diana Prince', 68, 'viraj/NZK PVT LMT', 26, 'Complete workshop on managing outsourced jewelry work orders, challan reconciliation and billing', 2, 23),
        (29, '2026-10-01 10:16:04', 'Barry Allen', 88, 'deep1/vinayaka LTD', 27, 'NIC E-Invoice portal API session token expired causing JSON schema validation 2150 error', 3, 23),
        (30, '2026-10-02 11:23:17', 'Arthur Curry', 134, 'TEST DLF/DLF CUSTOMER', 27, 'Reverse Charge Mechanism (RCM) 3% GST tax liability on unregistered purchases not showing in GSTR-3B', 4, 23),
        (31, '2026-10-03 12:30:30', 'Hal Jordan', 171, 'optigocarely/orail25', 27, 'TCS under Section 206C(1H) 0.1% deduction rule verification on receipt crossing 50 Lakhs limit', 5, 23),
        (32, '2026-10-04 13:37:43', 'Oliver Queen', 193, 'anjum/NAYKA JEWELS', 27, 'Short training on generating credit notes and debit notes with GST invoice linkage', 1, 23),
        (33, '2026-10-05 14:44:56', 'Victor Stone', 205, 'ambikesh/Madhav Jewellers', 27, 'Multi-currency export sales invoice roundoff difference causing balance sheet mismatch', 3, 23),
        (34, '2026-10-06 15:51:09', 'Selina Kyle', 213, 'John_Dev/John Dev', 27, 'Purchase invoice voucher GSTIN checksum validation failure on vendor tax registration', 4, 23),
        (35, '2026-10-07 16:58:22', 'Lex Luthor', 225, 'mili/Shah Pvt LMt', 27, 'Updated bank account IFSC code and RTGS details on tax invoice print layout', 11, 23),
        (36, '2026-10-08 17:05:35', 'Harvey Dent', 306, 'Scott/Travis and Company', 27, 'In-depth training on GST filing data export, HSN summary reports, and audit trail ledger review', 2, 23),
        (37, '2026-10-09 09:12:48', 'Dick Grayson', 343, 'AG/Avishkar gems', 27, 'Query regarding B2B retail cash sale limit of 2 Lakhs and mandatory PAN card requirement', 5, 23),
        (38, '2026-10-10 10:19:01', 'Barbara Gordon', 345, 'OM00000/OM JEWELLERS', 27, 'E-Way bill part-B vehicle registration number update API returning internal server error', 3, 23),
        (39, '2026-10-11 11:26:14', 'Jason Todd', 1444, 'VK18/One8', 28, 'Zebra ZD620 RFID desktop tag printer skipping alternate jewelry rat-tail barcode tags', 4, 23),
        (40, '2026-10-12 12:33:27', 'Tim Drake', 1505, 'VGD2004/Vinay Gold & Diamonds', 28, 'RFID handheld scanner reader disconnecting repeatedly during showroom physical inventory audit', 3, 23),
        (41, '2026-10-13 13:40:40', 'Alfred Pennyworth', 25, 'Dee/Dee_Creation', 28, 'Excel bulk product import throwing numeric overflow error on diamond gross weight column', 5, 23),
        (42, '2026-10-14 14:47:53', 'Lois Lane', 27, 'vidsy/Shah Pvt LMt', 28, 'Quick guidance on calibrating thermal transfer ribbon sensor for polyester jewelry labels', 1, 23),
        (43, '2026-10-15 15:54:06', 'Jim Gordon', 30, 'ThGems/skylark', 28, 'Dual-frequency RFID tray reader read rate drop below 92% in vault transfer counter', 4, 23),
        (44, '2026-10-16 16:01:19', 'John Constantine', 38, 'ABHISHEKS/M Diamond', 28, 'Tag reprint ledger audit log missing workstation IP and user id tracking information', 11, 23),
        (45, '2026-10-17 17:08:32', 'Zatanna Zatara', 47, 'ArjunMahajan/Kolar Gold Field', 28, 'QR code on 22K gold bangle tag unreadable due to dpi resolution mismatch in printer driver', 3, 23),
        (46, '2026-10-18 09:15:45', 'Wally West', 53, 'robert/Robert Downey Jr', 28, 'Full training session on annual stock audit using RFID wand and bulk Excel discrepancy reconciliation', 2, 23),
        (47, '2026-10-19 10:22:58', 'Dinah Lance', 66, 'goku/Jew Maufacturer', 28, 'Inquiry on configuring custom barcode format with item code, gross weight, and net weight', 5, 23),
        (48, '2026-10-20 11:29:11', 'Slade Wilson', 68, 'viraj/NZK PVT LMT', 29, 'Executive Daily Sales & Stock KPI dashboard timeout when loading multi-store aggregate view', 3, 23),
        (49, '2026-10-21 12:36:24', 'Ra''s al Ghul', 88, 'deep1/vinayaka LTD', 29, 'Diamond carat inventory aging report not filtering by certification laboratory (GIA / IGI / SGL)', 4, 23),
        (50, '2026-10-22 13:43:37', 'Harley Quinn', 134, 'TEST DLF/DLF CUSTOMER', 29, 'Karigar efficiency analysis report displaying negative gold loss variance on casting orders', 5, 23),
        (51, '2026-10-23 14:50:50', 'Son Goku', 171, 'optigocarely/orail25', 29, 'Short demo on generating Gross Margin Return on Investment (GMROI) report by jewellery category', 1, 23),
        (52, '2026-10-24 15:57:03', 'Vegeta', 193, 'anjum/NAYKA JEWELS', 29, 'Comprehensive training on customized financial reporting, cash flow projections, and profit analytics', 2, 23),
        (53, '2026-10-25 16:04:16', 'Naruto Uzumaki', 205, 'ambikesh/Madhav Jewellers', 29, 'Added custom column for hallmark HUID number in inventory stock status export report', 11, 23),
        (54, '2026-10-26 17:11:29', 'Sasuke Uchiha', 213, 'John_Dev/John Dev', 29, 'Retail store footfall vs conversion ratio analytics widget showing null values for weekend dates', 4, 23),
        (55, '2026-10-27 09:18:42', 'Kakashi Hatake', 225, 'mili/Shah Pvt LMt', 29, 'Report calculation query regarding average cost vs FIFO inventory valuation in gold bullion ledger', 5, 23),
        (56, '2026-10-28 10:25:55', 'Monkey D. Luffy', 306, 'Scott/Travis and Company', 29, 'Scheduled automated Monday email export of slow-moving inventory report failed to trigger', 3, 23),
        (57, '2026-10-01 11:32:08', 'Roronoa Zoro', 343, 'AG/Avishkar gems', 30, 'Automated payment reminder WhatsApp template rejected by Meta Cloud API due to variable parameters', 4, 23),
        (58, '2026-10-02 12:39:21', 'Levi Ackerman', 345, 'OM00000/OM JEWELLERS', 30, 'Customer anniversary and birthday greeting email automated cron job stuck in queued status', 3, 23),
        (59, '2026-10-03 13:46:34', 'Eren Yeager', 1444, 'VK18/One8', 30, 'WhatsApp interactive catalog purchase button click webhook not creating lead in CRM module', 5, 23),
        (60, '2026-10-04 14:53:47', 'Light Yagami', 1505, 'VGD2004/Vinay Gold & Diamonds', 30, 'Quick walk-through on setting up festive greeting broadcast templates in WhatsApp manager', 1, 23),
        (61, '2026-10-05 15:00:00', 'Satoru Gojo', 25, 'Dee/Dee_Creation', 30, 'Sales quotation PDF attachment corrupted when dispatched through enterprise SMTP mail server', 4, 23),
        (62, '2026-10-06 16:07:13', 'Tanjiro Kamado', 27, 'vidsy/Shah Pvt LMt', 30, 'Updated customer support email address and WhatsApp business display name configuration', 11, 23),
        (63, '2026-10-07 17:14:26', 'Edward Elric', 30, 'ThGems/skylark', 30, 'Staff training on omnichannel customer communication: WhatsApp chat inbox, automated SMS, and emails', 2, 23),
        (64, '2026-10-08 09:21:39', 'Spike Spiegel', 38, 'ABHISHEKS/M Diamond', 30, 'Multi-session WhatsApp web QR code disconnecting automatically after every 24 hours', 3, 23),
        (65, '2026-10-09 10:28:52', 'Ichigo Kurosaki', 47, 'ArjunMahajan/Kolar Gold Field', 30, 'Query regarding webhook rate limits for sending bulk delivery status notifications to clients', 5, 23),
        (66, '2026-10-10 11:35:05', 'Ken Kaneki', 53, 'robert/Robert Downey Jr', 31, 'B2B ProCatalog wholesale item prices not updating dynamically after morning gold rate revision', 4, 23),
        (67, '2026-10-11 12:42:18', 'Saitama', 66, 'goku/Jew Maufacturer', 31, 'Shopify e-commerce connector stock quantity webhook desynchronized for certified solitaire rings', 3, 23),
        (68, '2026-10-12 13:49:31', 'Genos', 68, 'viraj/NZK PVT LMT', 31, 'B2B wholesale order minimum order quantity (MOQ) rule failing to validate during checkout', 5, 23),
        (69, '2026-10-13 14:56:44', 'Megumi Fushiguro', 88, 'deep1/vinayaka LTD', 31, 'Short guidance on publishing new festive jewellery collection to customer digital catalog portal', 1, 23),
        (70, '2026-10-14 15:03:57', 'Yuji Itadori', 134, 'TEST DLF/DLF CUSTOMER', 31, 'High-resolution 360-degree jewelry video upload failing with HTTP 413 payload too large error', 4, 23),
        (71, '2026-10-15 16:10:10', 'Nezuko Kamado', 171, 'optigocarely/orail25', 31, 'Updated promotional discount coupon banner and terms & conditions on client web catalog', 11, 23),
        (72, '2026-10-16 17:17:23', 'Zenitsu Agatsuma', 193, 'anjum/NAYKA JEWELS', 31, 'Full onboarding on managing online catalog categories, diamond filters, and B2B pricing tiers', 2, 23),
        (73, '2026-10-17 09:24:36', 'Inosuke Hashibira', 205, 'ambikesh/Madhav Jewellers', 31, 'Customer wishlist synchronization failing between e-commerce web storefront and back-office ERP', 3, 23),
        (74, '2026-10-18 10:31:49', 'Roy Mustang', 213, 'John_Dev/John Dev', 31, 'Query on configuring customer credit limit validation before allowing online order placement', 5, 23),
        (75, '2026-10-19 11:38:02', 'L Lawliet', 225, 'mili/Shah Pvt LMt', 32, 'Sales executive counter tablet application crashing during camera barcode scanning in offline mode', 4, 23),
        (76, '2026-10-20 12:45:15', 'John Wick', 306, 'Scott/Travis and Company', 32, 'Customer KYC Aadhaar card document capture photo upload failing on iOS version 18 devices', 3, 23),
        (77, '2026-10-21 13:52:28', 'Thomas Anderson Neo', 343, 'AG/Avishkar gems', 32, 'Bluetooth ESC/POS thermal receipt printer disconnecting when switching between sales counter tabs', 5, 23),
        (78, '2026-10-22 14:59:41', 'James Bond', 345, 'OM00000/OM JEWELLERS', 32, 'Short tutorial for showroom staff on taking customer digital signature on tablet delivery challan', 1, 23),
        (79, '2026-10-23 15:06:54', 'Ethan Hunt', 1444, 'VK18/One8', 32, 'Live bullion gold rate ticker banner freezing on Android tablet application home screen', 4, 23),
        (80, '2026-10-24 16:13:07', 'Vito Corleone', 1505, 'VGD2004/Vinay Gold & Diamonds', 32, 'Push notification alert setup for showroom managers when high-value estimate is created', 11, 23),
        (81, '2026-10-25 17:20:20', 'Michael Corleone', 25, 'Dee/Dee_Creation', 32, 'Showroom sales floor training: customer registration, digital catalog browsing, and tablet billing', 2, 23),
        (82, '2026-10-26 09:27:33', 'Tyler Durden', 27, 'vidsy/Shah Pvt LMt', 32, 'Biometric fingerprint login authentication failed repeatedly after tablet OS system update', 3, 23),
        (83, '2026-10-27 10:34:46', 'Maximus Decimus', 30, 'ThGems/skylark', 32, 'Inquiry on locking tablet app into single-app kiosk mode for showroom customer feedback terminal', 5, 23),
        (84, '2026-10-28 11:41:59', 'Luke Skywalker', 38, 'ABHISHEKS/M Diamond', 33, 'AI jewellery design recommendation engine returning 504 gateway timeout for solitaire ring queries', 3, 23),
        (85, '2026-10-01 12:48:12', 'Han Solo', 47, 'ArjunMahajan/Kolar Gold Field', 33, 'AI demand forecasting module projecting negative stock recommendations for 22K yellow gold bangles', 4, 23),
        (86, '2026-10-02 13:55:25', 'Indiana Jones', 53, 'robert/Robert Downey Jr', 33, 'Voice-to-text quotation voice assistant misinterpreting gross weight grams as pennyweight units', 5, 23),
        (87, '2026-10-03 14:02:38', 'Dominic Toretto', 66, 'goku/Jew Maufacturer', 33, 'Short demo on utilizing AI smart auto-categorization for incoming customer support email inquiries', 1, 23),
        (88, '2026-10-04 15:09:51', 'Ellen Ripley', 68, 'viraj/NZK PVT LMT', 33, 'Computer vision diamond clarity grading inference model failing on micro-inclusion photographic test', 4, 23),
        (89, '2026-10-05 16:16:04', 'Sarah Connor', 88, 'deep1/vinayaka LTD', 33, 'AI knowledge base vector index updated with new FY 2026-27 gold scheme policy documents', 11, 23),
        (90, '2026-10-06 17:23:17', 'Marty McFly', 134, 'TEST DLF/DLF CUSTOMER', 33, 'Advanced training on deploying AI-powered customer purchase propensity scoring model for marketing', 2, 23),
        (91, '2026-10-07 09:30:30', 'Doc Emmett Brown', 171, 'optigocarely/orail25', 33, 'Natural language query generator generating malformed SQL query for daily sales breakdown', 3, 23),
        (92, '2026-10-08 10:37:43', 'Rick Deckard', 193, 'anjum/NAYKA JEWELS', 33, 'Query regarding training custom AI image classification model on proprietary CAD jewelry sketches', 5, 23),
        (93, '2026-10-09 11:44:56', 'Jack Sparrow', 205, 'ambikesh/Madhav Jewellers', 34, 'Refresher training for finance team on financial year-end closing, depreciation, and ledger balance migration', 2, 23),
        (94, '2026-10-10 12:51:09', 'William Wallace', 213, 'John_Dev/John Dev', 34, 'Consultation on standard operating procedure for gold rate booking advance schemes and ledger entries', 1, 23),
        (95, '2026-10-11 13:58:22', 'Forrest Gump', 225, 'mili/Shah Pvt LMt', 34, 'Consulting discussion on best practices for tracking physical vs book gold loss across 5 retail branches', 5, 23),
        (96, '2026-10-12 14:05:35', 'Bryan Mills', 306, 'Scott/Travis and Company', 34, 'Senior management consulting session on centralizing multi-warehouse diamond distribution operations', 2, 23),
        (97, '2026-10-13 15:12:48', 'Vincent Vega', 343, 'AG/Avishkar gems', 34, 'Store manager retraining on physical stock audit discrepancy resolution and approval matrix workflow', 1, 23),
        (98, '2026-10-14 16:19:01', 'Jules Winnfield', 345, 'OM00000/OM JEWELLERS', 34, 'Updated standard operating procedure document for diamond return from exhibition consignment', 11, 23),
        (99, '2026-10-15 17:26:14', 'Morpheus', 1444, 'VK18/One8', 34, 'Advisory on restructuring chart of accounts for upcoming foreign export subsidiary integration', 4, 23),
        (100, '2026-10-16 09:33:27', 'Trinity', 1505, 'VGD2004/Vinay Gold & Diamonds', 34, 'Consultation regarding optimal RFID frequency configuration for high-density diamond necklace trays', 5, 23);

    -- 3. Bulk Insert into [dbo].[CallLog]
    INSERT INTO [dbo].[CallLog] (
        CallLogId,
        EntryDate,
        CustomerName,
        ProjectID,
        AppId,
        Descr,
        DeptId,
        EmpId,
        Source,
        CreatedBy,
        CreatedDate,
        IsActive,
        ProjectCode,
        CreatedByCode,
        IsClient,
        CorpId,
        CallTypeId,
        ExternalStatusID
    )
    SELECT 
        @StartCallLogId + RowId AS CallLogId,
        EntryDate,
        CustomerName,
        ProjectID,
        AppId,
        Descr,
        0 AS DeptId,
        0 AS EmpId,
        'Support' AS Source,
        CreatedBy,
        EntryDate AS CreatedDate,
        1 AS IsActive,
        ProjectCode,
        DB_NAME() AS CreatedByCode,
        0 AS IsClient,
        0 AS CorpId,
        CallTypeId,
        44 AS ExternalStatusID
    FROM #StagingCallLogs
    ORDER BY RowId;

    -- 4. Bulk Insert into [dbo].[CallLog_tracking] to ensure full audit trail & UI compatibility
    INSERT INTO [dbo].[CallLog_tracking] (
        LogId,
        CallLogId,
        EntryDate,
        CustomerName,
        ProjectID,
        AppId,
        Descr,
        DeptId,
        EmpId,
        Source,
        CreatedBy,
        CreatedDate
    )
    SELECT 
        @StartLogId + RowId AS LogId,
        @StartCallLogId + RowId AS CallLogId,
        EntryDate,
        CustomerName,
        ProjectID,
        AppId,
        Descr,
        0 AS DeptId,
        0 AS EmpId,
        'Support' AS Source,
        CreatedBy,
        EntryDate AS CreatedDate
    FROM #StagingCallLogs
    ORDER BY RowId;

    -- 5. Clean up temporary table
    DROP TABLE #StagingCallLogs;

    COMMIT TRANSACTION;

    SELECT 
        'SUCCESS' AS Status,
        100 AS InsertedCount,
        @StartCallLogId + 1 AS FirstCallLogId,
        @StartCallLogId + 100 AS LastCallLogId,
        '100 professional ERP call log entries added successfully!' AS Message;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    IF OBJECT_ID('tempdb..#StagingCallLogs') IS NOT NULL
        DROP TABLE #StagingCallLogs;

    SELECT 
        'ERROR' AS Status,
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
