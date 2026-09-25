import asyncio
from playwright.async_api import async_playwright
import os
import sys

async def run_audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to http://localhost:3080/...")
        page.on("dialog", lambda dialog: asyncio.create_task(handle_dialog(dialog)))
        
        async def handle_dialog(dialog):
            print(f"ALERT: {dialog.message}")
            await dialog.accept()
            
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))

        try:
            await page.goto("http://localhost:3080/dashboard/audit/new")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return
            
        print("Waiting for file input to appear...")
        file_input = page.locator("input[type='file']")
        await file_input.wait_for(state="attached")
        print("Setting up file chooser...")
        pdf_path = os.path.abspath("NyayaSETU_Strong_Compliance_Test_Contract_India(2).pdf")
        
        await file_input.set_input_files(pdf_path)
        print("File selected.")
        
        print("Waiting for Start Legal Audit button to appear (CONFIGURING step)...")
        # In CONFIGURING step, button appears
        start_btn = page.locator("button:has-text('Start Legal Audit')")
        try:
            await start_btn.wait_for(state="visible", timeout=400000)
            await start_btn.click()
            print("Clicked Start Legal Audit button!")
        except Exception as e:
            print("Could not find or click Start Legal Audit button.")
            content = await page.content()
            if "Unsupported file type" in content:
                print("ERROR: Unsupported file type detected in UI!")
            else:
                print(content[:500])
            return
        # Usually redirects to /dashboard/audit/{id}/live
        import re
        try:
            await page.wait_for_url(re.compile(r".*/live.*"), timeout=30000)
            print("Reached Live Audit page!")
        except:
            print("Failed to reach Live Audit page within 30 seconds.")
            content = await page.content()
            print(content[:500])
            return

        print("Monitoring SSE stream...")
        
        # We need to check for "Connection to audit engine lost or closed"
        # We need to check if Clause 7 is detected
        # We need to wait for Final Verdict/Report
        
        has_clause_7 = False
        is_legal_noncompliance = False
        is_grounded = False
        has_evidence = False
        no_connection_error = True
        
        # Read the logs panel continuously
        for i in range(120): # wait up to 10 minutes (120 * 5s)
            await asyncio.sleep(5)
            
            logs_text = await page.locator("body").inner_text()
            
            if "Connection to audit engine lost or closed" in logs_text:
                no_connection_error = False
                print("FAIL: 'Connection to audit engine lost or closed' appeared!")
                break
                
            if "Clause 7" in logs_text or "Gratuity" in logs_text:
                has_clause_7 = True
                
            if "LEGAL_NONCOMPLIANCE" in logs_text:
                is_legal_noncompliance = True
                
            if "five days' wages" in logs_text or "exact_contract_quote" in logs_text or "Exact Quote:" in logs_text:
                is_grounded = True
                
            if "Evidence" in logs_text or "Code_on_Social_Security" in logs_text or "Payment of Gratuity" in logs_text:
                has_evidence = True
                
            if "COMPLETE" in logs_text or "Final Report" in logs_text or "View Final Report" in logs_text or "Export Report" in logs_text or "Audit completed" in logs_text:
                print("Audit completed successfully!")
                break
                
            print(f"[{i*5}s] Audit still running... (has_clause_7={has_clause_7})")
            
        print("\n--- RESULTS ---")
        print(f"No connection error: {no_connection_error}")
        print(f"Clause 7 detected: {has_clause_7}")
        print(f"Classified as LEGAL_NONCOMPLIANCE: {is_legal_noncompliance}")
        print(f"Deterministically grounded: {is_grounded}")
        print(f"Legal evidence attached: {has_evidence}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_audit())
