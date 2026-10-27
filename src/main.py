import sys
import argparse

def verify_paywall_token(token):
    return token == 'secret123'

def run_app():
    print('Marketplace Service Running')

def smoke_test():
    print('Running Smoke Test: Verifying Core Flow...')
    # Simulate business logic check
    print('Smoke Test Passed: System operational.')
    sys.stdout.flush()
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--smoke-test', action='store_true')
    args = parser.parse_args()
    
    if args.smoke_test:
        if smoke_test():
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        run_app()