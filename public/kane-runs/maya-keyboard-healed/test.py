import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="c36d279f-f720-40ec-aa92-36d638b4bbd8",
    name="Complete Order with Express Air Shipping via Keyboard",
    tc_id="TC-2",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"kurogami_atelier_checkout_stage_visible": "true", "shipping_badge_express_air": "Express Air", "confirmation_banner_order_confirmed_check": "true", "order_receipt": "ORD-MAYA-8841"},
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to http://localhost:4180/?persona=maya', instruction_id='db0b354b-b178-46dd-9e31-6c46fd96a727'):
        await page.goto("http://localhost:4180/?persona=maya")
    
    async with testmu.step('Checking whether the Kurogami Atelier checkout stage is present'):
        set_var('kurogami_atelier_checkout_stage_visible', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {64: 0};\n  const el = (i) => els[__m[i]];\n  const __v = ((() => { const e = el(64); const s = getComputedStyle(e); return e.innerText.includes('KUROGAMI ATELIER') && s.display !== 'none' && s.visibility !== 'hidden' && e.getClientRects().length > 0; })());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['div >> internal:has-text="Kurogami Atelier · Kyoto /"i >> nth=5'], query='whether the Kurogami Atelier checkout stage is present (on the checkout stage)', expected_value='true', needs_unit_conversion=False, operator='equals', transforms=[], condition='the Kurogami Atelier checkout stage is visible'))
    
    async with testmu.step('Assertion check', instruction_id='a6ea982f-2e01-463a-872c-fa5fca6d66ba'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'the Kurogami Atelier checkout stage is visible', 'passed': True, 'operator': 'equals', 'transforms': [], 'json_path': None, 'expected': 'true', 'extracted_value': '{{kurogami_atelier_checkout_stage_visible}}', 'store_key': 'kurogami_atelier_checkout_stage_visible', 'variable_refs': {'{{kurogami_atelier_checkout_stage_visible}}': 'true'}}], 'sub_checks': [{'description': 'the Kurogami Atelier checkout stage is visible', 'store_key': 'kurogami_atelier_checkout_stage_visible', 'expected_value': 'true', 'extracted_value': '{{kurogami_atelier_checkout_stage_visible}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'the Kurogami Atelier checkout stage is visible'})
    
    async with testmu.step('Pressing Tab to focus the Express Air shipping option', instruction_id='a13a3f85-fb1a-4358-adee-2fca17e8861e'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Pressing Tab to focus the Express Air shipping option', instruction_id='18367edb-8ebd-4729-93d7-33bbc5b1f5de'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Waiting for rerun actions to complete', instruction_id='e27111b3-ca18-4afc-aead-7520d39c006b'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Press Tab', instruction_id='4f4599f8-ea8d-425c-90f9-0681bb9f38da'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='893ba707-c146-4c6f-a139-12f4843345ec'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='1bf25de0-c3e4-406c-8302-f2aba91237ee'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='2c498893-fbaf-4bb2-b0be-31ebdcbbffe1'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='45df5b28-3a09-41b1-8e81-27ba37d7a0ad'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='f8e1ad9a-3f83-4731-9113-5d8366511735'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='567e2ec8-1bf1-4065-a86c-3d0602b20213'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='585df36d-ebf7-4c33-b2b9-448ed08556f2'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Waiting for the plan queue to finish', instruction_id='6171dc61-cabd-412b-b715-e9750c2a9db3'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Press Tab', instruction_id='8dc6049a-6233-4329-b1e7-04d28c572764'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='f6b40614-0c98-4d97-b93f-4a246aa61dc3'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='a868d437-f893-4fb7-b90c-88600c27a045'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Waiting for the queued plan to start', instruction_id='301f0f4e-9415-4d06-b796-a55f4e862ec7'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Press Tab', instruction_id='0dd6e4ea-0280-407c-b902-e64b20f1c5a5'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='29b70bbb-f8fc-4115-8db5-850029ca18b2'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='6da3f850-7884-45a5-bc4a-26b0f2e6d40f'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='dc381ee9-6a97-40df-b3eb-1d27269eca89'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Press Tab', instruction_id='6ada8bc0-8ce6-4d84-895d-245218f779b5'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Confirming focus on the Express Air shipping option', instruction_id='cddf214b-58e8-47d6-b592-e847d129af77'):
        await page.wait_for_timeout(100)
    
    async with testmu.step('Pressing Enter to activate the Express Air shipping option', instruction_id='5dfe70f7-9c03-421a-86fb-3dde30c0d8e7'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Enter')
    
    async with testmu.step('Reading the selected shipping method label'):
        set_var('shipping_badge_express_air', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {65: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(65).querySelector('div > span').innerText.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=button[name="Express Air <button> TAB OK $"i]'], query='the selected shipping method label in the Express Air shipping option', expected_value='Express Air', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='the shipping badge updates to Express Air'))
    
    async with testmu.step('Assertion check', instruction_id='db53d483-b600-47a7-ad96-24dfd0b2248e'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'the shipping badge updates to Express Air', 'passed': True, 'operator': 'equals', 'transforms': ['strip'], 'json_path': None, 'expected': 'Express Air', 'extracted_value': '{{shipping_badge_express_air}}', 'store_key': 'shipping_badge_express_air', 'variable_refs': {'{{shipping_badge_express_air}}': 'Express Air'}}], 'sub_checks': [{'description': 'the shipping badge updates to Express Air', 'store_key': 'shipping_badge_express_air', 'expected_value': 'Express Air', 'extracted_value': '{{shipping_badge_express_air}}', 'operator': 'equals', 'transforms': ['strip']}], 'composite_operator': 'and', 'claim': 'the shipping badge updates to Express Air'})
    
    async with testmu.step('Pressing the Tab key', instruction_id='eaec59bb-ebc9-46e8-9cb9-b6f69ddca4c2'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Pressing the Tab key', instruction_id='9d6b3eb4-646d-40a2-a6b6-b7aff6471e8e'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Pressing Tab key', instruction_id='50af1994-e8ea-4a7c-851c-fea626df17a2'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Tab')
    
    async with testmu.step('Pressing Enter', instruction_id='f643234b-23a1-482f-a155-f9051c50aebb'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Enter')
    
    async with testmu.step('Checking whether the confirmation banner contains Order Confirmed'):
        set_var('confirmation_banner_order_confirmed_check', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {69: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (/Order Confirmed/.test(el(69).innerText));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=status'], query='whether the confirmation banner containing "Order Confirmed" is present (in the order confirmation status)', expected_value='true', needs_unit_conversion=False, operator='equals', transforms=[], condition='the confirmation banner contains "Order Confirmed"'))
    
    async with testmu.step('Extracting the order receipt code from the confirmation status'):
        set_var('order_receipt', await testmu.textual_analyzer(page, wrapped_js='(els) => {\n  const __m = {69: 0};\n  const el = (i) => els[__m[i]];\n  const __v = ((el(69).textContent.match(/"order_receipt"\\s*:\\s*"([^"]+)"/) || [])[1] || null);\n  return (typeof __v === \'boolean\' ? String(__v) : __v);\n}', locators=['internal:role=status'], query='the displayed order receipt code in the order confirmation status', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='the displayed order receipt code is stored as {{order_receipt}}'))
    
    async with testmu.step('Assertion check', instruction_id='6a85546d-f63c-4fb8-88fe-cfddf2c84002'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'the confirmation banner contains "Order Confirmed"', 'passed': True, 'operator': 'equals', 'transforms': [], 'json_path': None, 'expected': 'true', 'extracted_value': '{{confirmation_banner_order_confirmed_check}}', 'store_key': 'confirmation_banner_order_confirmed_check', 'variable_refs': {'{{confirmation_banner_order_confirmed_check}}': 'true'}}], 'sub_checks': [{'description': 'the confirmation banner contains "Order Confirmed"', 'store_key': 'confirmation_banner_order_confirmed_check', 'expected_value': 'true', 'extracted_value': '{{confirmation_banner_order_confirmed_check}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'the confirmation banner contains "Order Confirmed"'})


if __name__ == "__main__":
    testmu.run(test)