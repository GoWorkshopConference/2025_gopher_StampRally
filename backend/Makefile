SHELL := /bin/bash
include configs/lint-options.env
include configs/swagger-options.env
include configs/mock-options.env
include configs/oapicodegen-options.env
include configs/wire-options.env

.PHONY: build test tidy compose-up compose-down swagger-gen swagger-check mock-gen mock-check wire-gen wire-check lint

build:
	@echo "Building services..."
	@go1.24.0 build ./services/...
	@echo "Build completed."

test:
	@echo "Running tests..."
	@go test -v ./services/...
	@echo "Tests completed."

lint:
	@echo "Running linter with Go 1.24..."
	@PATH=$(shell go1.24.0 env GOPATH)/bin:$(PATH) go1.24.0 mod tidy
	@PATH=$(shell go1.24.0 env GOPATH)/bin:$(PATH) go1.24.0 build ./services/...
	@PATH=$(shell go1.24.0 env GOPATH)/bin:$(PATH) golangci-lint run $(LINT_TARGETS) --config=$(LINT_CONFIG_PATH)
	@echo "Linting completed."

tidy:
	@echo "Tidying modules..."
	@go1.24.0 mod tidy
	@echo "Tidying completed."

compose-up:
	@echo "Starting docker compose..."
	@docker compose up -d

compose-down:
	@echo "Stopping docker compose..."
	@docker compose down

swagger-gen:
	@echo "Generating Swagger files..."
	@mkdir -p $(SWAGGER_OUTPUT_DIR)
	@oapi-codegen $(OAPI_GENERATE_OPTIONS) \
		$(SWAGGER_SPEC_PATH) > $(SWAGGER_OUTPUT_DIR)/gopher-stamp-crud.gen.go
	@echo "Swagger generation completed."

swagger-check:
	@echo "Checking if Swagger files are up to date..."
	@mkdir -p $(SWAGGER_OUTPUT_DIR)/tmp
	@oapi-codegen $(OAPI_GENERATE_OPTIONS) \
		$(SWAGGER_SPEC_PATH) > $(SWAGGER_OUTPUT_DIR)/tmp/gopher-stamp-crud.gen.go
	@if ! diff -r $(SWAGGER_OUTPUT_DIR)/gopher-stamp-crud.gen.go $(SWAGGER_OUTPUT_DIR)/tmp/gopher-stamp-crud.gen.go > /dev/null 2>&1; then \
		echo "Error: Swagger files are not up to date. Please run 'make swagger-gen'"; \
		rm -rf $(SWAGGER_OUTPUT_DIR)/tmp; \
		exit 1; \
	fi
	@rm -rf $(SWAGGER_OUTPUT_DIR)/tmp
	@echo "Swagger files are up to date."

mock-gen:
	@echo "Generating mocks..."
	@for file in $$(find $(MOCK_SOURCE_DIR) -name "*.go"); do \
		base_name=$$(basename $$file .go); \
		self_package=$$(go list -m)/$(MOCK_PACKAGE); \
		go run github.com/golang/mock/mockgen \
			-source=$$file \
			-destination=$(MOCK_DEST_DIR)/mock_$$base_name.go \
			-package=$(MOCK_PACKAGE) \
			-self_package=$$self_package; \
	done
	@echo "Mock generation completed."

mock-check:
	@echo "Checking if mock files are up to date..."
	@mkdir -p $(MOCK_DEST_DIR)/tmp
	@status=0; \
	for file in $$(find $(MOCK_SOURCE_DIR) -name "*.go"); do \
		base_name=$$(basename $$file .go); \
		self_package=$$(go list -m)/$(MOCK_PACKAGE); \
		go run github.com/golang/mock/mockgen \
			-source=$$file \
			-destination=$(MOCK_DEST_DIR)/tmp/mock_$$base_name.go \
			-package=$(MOCK_PACKAGE) \
			-self_package=$$self_package; \
		if [ ! -f $(MOCK_DEST_DIR)/mock_$$base_name.go ] || ! diff -q $(MOCK_DEST_DIR)/mock_$$base_name.go $(MOCK_DEST_DIR)/tmp/mock_$$base_name.go > /dev/null; then \
			echo "Error: Mock file mock_$$base_name.go is not up to date. Please run 'make mock-gen'"; \
			status=1; \
		fi; \
	done; \
	rm -rf $(MOCK_DEST_DIR)/tmp; \
	if [ $$status -eq 1 ]; then \
		exit 1; \
	fi
	@echo "Mock files are up to date."

wire-gen:
	@echo "Generating Wire dependency injection code..."
	@cd $(WIRE_SOURCE_DIR) && go run github.com/google/wire/cmd/wire .
	@echo "Wire generation completed."

wire-check:
	@echo "Checking if Wire files are up to date..."
	@cd $(WIRE_SOURCE_DIR) && \
		tmpfile=$$(mktemp) && \
		cp $(WIRE_GEN_FILE) $$tmpfile && \
		go run github.com/google/wire/cmd/wire . > /dev/null 2>&1 && \
		if ! diff -q $$tmpfile $(WIRE_GEN_FILE) > /dev/null; then \
			echo "Error: Wire generated code is outdated. Please run 'make wire-gen'"; \
			diff -u $$tmpfile $(WIRE_GEN_FILE) || true; \
			cp $$tmpfile $(WIRE_GEN_FILE); \
			rm -f $$tmpfile; \
			exit 1; \
		fi; \
		rm -f $$tmpfile
	@echo "Wire files are up to date."
